const fs = require("fs");
const path = require("path");

const RESOURCES_ROOT = path.join(__dirname, "resources", "wpt");
const RESOURCE_WEB_BASE = "/resources/wpt";

function readText(relativePath) {
  return fs.readFileSync(path.join(RESOURCES_ROOT, relativePath), "utf8");
}

function firstNonGeneric(...values) {
  for (const value of values) {
    const clean = (value || "").trim();
    if (!clean) continue;
    if (/^(document|page|index)$/i.test(clean)) continue;
    return clean;
  }
  return "";
}

function isWeakTitle(value) {
  const clean = (value || "").trim();
  return !clean || /^(document|page|index)$/i.test(clean) || /^\d+\s+page\d+$/i.test(clean);
}

function listFiles(relativeDir, matcher) {
  const absoluteDir = path.join(RESOURCES_ROOT, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  return fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && matcher.test(entry.name))
    .map((entry) => path.join(relativeDir, entry.name))
    .sort();
}

function listFilesRecursive(relativeDir, matcher) {
  const absoluteDir = path.join(RESOURCES_ROOT, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const results = [];

  function walk(currentAbsolute, currentRelative) {
    for (const entry of fs.readdirSync(currentAbsolute, { withFileTypes: true })) {
      const nextAbsolute = path.join(currentAbsolute, entry.name);
      const nextRelative = path.join(currentRelative, entry.name);

      if (entry.isDirectory()) {
        walk(nextAbsolute, nextRelative);
      } else if (matcher.test(entry.name)) {
        results.push(nextRelative);
      }
    }
  }

  walk(absoluteDir, relativeDir);
  return results.sort();
}

function normalizeReactCdn(html) {
  return html
    .replace(/https:\/\/unpkg\.com\/react@18\/umd\/react\.development\.js/g, "/vendor/react/react.development.js")
    .replace(/https:\/\/unpkg\.com\/react-dom@18\/umd\/react-dom\.development\.js/g, "/vendor/react-dom/react-dom.development.js");
}

function getAbsoluteResourceUrl(relativeFile, assetPath) {
  const normalized = assetPath.replace(/\\/g, "/");
  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith("data:") || normalized.startsWith("/")) {
    return normalized;
  }

  const fileDirectory = path.posix.dirname(relativeFile.replace(/\\/g, "/"));
  const resolved = path.posix.normalize(path.posix.join(fileDirectory, normalized));
  return `${RESOURCE_WEB_BASE}/${resolved}`;
}

function rewriteLocalAssetUrls(relativePath, html) {
  return html.replace(
    /\b(src|href|poster)=["']([^"']+)["']/gi,
    (match, attr, value) => `${attr}="${getAbsoluteResourceUrl(relativePath, value)}"`
  );
}

function extractHtmlExample(relativePath, options = {}) {
  const {
    inlineLocalScripts = true,
    inlineLocalStylesheets = true,
    replaceReactCdn = false
  } = options;

  let raw = readText(relativePath);
  if (replaceReactCdn) {
    raw = normalizeReactCdn(raw);
  }

  const cssParts = [];
  const jsParts = [];

  raw = raw.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_match, css) => {
    cssParts.push(css.trim());
    return "";
  });

  raw = raw.replace(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, (_match, js) => {
    jsParts.push(js.trim());
    return "";
  });

  if (inlineLocalStylesheets) {
    raw = raw.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
      if (!/rel=["'][^"']*stylesheet/i.test(match) || /^(https?:)?\/\//i.test(href)) {
        return match;
      }

      const absoluteSource = path.join(path.dirname(path.join(RESOURCES_ROOT, relativePath)), href);
      cssParts.push(fs.readFileSync(absoluteSource, "utf8").trim());
      return "";
    });
  }

  if (inlineLocalScripts) {
    raw = raw.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
      if (/^(https?:)?\/\//i.test(src) || src.startsWith("/vendor/")) {
        return match;
      }

      const absoluteSource = path.join(path.dirname(path.join(RESOURCES_ROOT, relativePath)), src);
      jsParts.push(fs.readFileSync(absoluteSource, "utf8").trim());
      return "";
    });
  }

  return {
    html: rewriteLocalAssetUrls(relativePath, raw.trim()),
    css: cssParts.filter(Boolean).join("\n\n"),
    js: jsParts.filter(Boolean).join("\n\n")
  };
}

function createJsOnlyTopic(html, css, relativeScripts) {
  return {
    html,
    css,
    js: relativeScripts.map((file) => readText(file).trim()).join("\n\n")
  };
}

function stripExtension(name) {
  return name.replace(/\.[^.]+$/, "");
}

function humanizeSegment(segment) {
  return stripExtension(segment)
    .replace(/[_-]+/g, " ")
    .replace(/\./g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function humanizeLabel(segment) {
  return String(segment)
    .replace(/[_-]+/g, " ")
    .replace(/\./g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractHtmlSignals(rawHtml) {
  const title = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
  const h1 = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
  const h2 = rawHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
  const h3 = rawHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
  const button = rawHtml.match(/<(button|input)[^>]*(?:value|type|onclick)?[^>]*>([\s\S]*?)<\/button>/i)?.[2]?.replace(/\s+/g, " ").trim() || "";
  const bodyText = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { title, h1, h2, h3, button, bodyText };
}

function inferTitle(relativePath, category, rawSource = "") {
  const normalized = relativePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const fileName = parts[parts.length - 1];
  const parent = parts[parts.length - 2] || category;
  const signals = rawSource && /\.html?$/i.test(fileName) ? extractHtmlSignals(rawSource) : {};
  const contentTitle = firstNonGeneric(signals.title, signals.h1, signals.h2, signals.h3, signals.button);

  if (contentTitle) {
    if (/^(home|contact us|campus)$/i.test(contentTitle)) {
      return `${humanizeSegment(parent)} ${contentTitle}`;
    }
    return contentTitle;
  }

  if (signals.bodyText) {
    const firstSentence = signals.bodyText.split(/[.!?]/)[0]?.trim() || "";
    if (firstSentence && firstSentence.length < 60) {
      return humanizeSegment(firstSentence);
    }
  }

  if (/\.jsx?$/i.test(fileName)) {
    const functionName =
      rawSource.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/)?.[1] ||
      rawSource.match(/const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\(/)?.[1] ||
      rawSource.match(/const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\[/)?.[1] ||
      "";

    if (functionName) {
      return humanizeSegment(functionName);
    }
  }

  if (/server\d*\.js$/i.test(fileName) && /createServer/.test(rawSource)) {
    return "Node HTTP Server";
  }
  if (/server\.js$/i.test(fileName) && /express/.test(rawSource) && /Router/.test(rawSource)) {
    return "Express Router Setup";
  }
  if (/server\.js$/i.test(fileName) && /express/.test(rawSource) && /app\.use/.test(rawSource)) {
    return "Express Middleware And Routes";
  }
  if (/server\.js$/i.test(fileName) && /express/.test(rawSource)) {
    return "Express Server Basics";
  }
  if (/demo\d+\.js$/i.test(fileName) && /filter\(/.test(rawSource)) {
    return "Array filter()";
  }
  if (/demo\d+\.js$/i.test(fileName) && /map\(/.test(rawSource)) {
    return "Array map()";
  }
  if (/demo\d+\.js$/i.test(fileName) && /push\(/.test(rawSource)) {
    return "Array push()";
  }
  if (/demo\d+\.js$/i.test(fileName) && /useState/.test(rawSource)) {
    return "useState Hook";
  }
  if (/\blet\b/.test(rawSource) && /\bconst\b/.test(rawSource)) {
    return "let And const";
  }
  if (/Hello from demo/i.test(rawSource)) {
    return "External Script Demo";
  }
  if (/startReact/.test(rawSource) && /React\.createElement/.test(rawSource)) {
    const reactText = rawSource.match(/React\.createElement\([^,]+,\s*null,\s*['"]([^'"]+)['"]/);
    return reactText?.[1] ? `React createElement: ${reactText[1]}` : "React createElement Rendering";
  }
  if (/console\.log\(["']Hello World/i.test(rawSource)) {
    return "Hello World Logging";
  }

  if (/^page\d+/i.test(fileName)) {
    return `${humanizeSegment(parent)} ${humanizeSegment(fileName)}`;
  }

  if (/^demo\d+/i.test(fileName)) {
    const demoNumber = stripExtension(fileName).replace(/^demo/i, "");
    return `${humanizeSegment(parent)} Demo ${demoNumber}`;
  }

  if (/^main\d*/i.test(fileName)) {
    return `${humanizeSegment(parent)} ${humanizeSegment(fileName)}`;
  }

  return `${humanizeSegment(parent)} ${humanizeSegment(fileName)}`.trim();
}

function buildGenericPoints(category, relativePath, title = "") {
  const hint = humanizeSegment(path.dirname(relativePath).split(path.sep).pop() || category);
  const categoryLower = category.toLowerCase();

  return [
    `${title || "This lesson"} comes from the ${hint} resource section.`,
    `Edit the code and rerun it to see how the ${categoryLower} concept changes in practice.`,
    "Try changing one small thing at a time so the effect is easy to observe."
  ];
}

function buildSummary(category, relativePath, title = "") {
  const hint = humanizeSegment(path.dirname(relativePath).split(path.sep).pop() || category);
  return title
    ? `Learn ${title} through a runnable example pulled from the ${hint} lesson set.`
    : `Learn ${hint} through a runnable example pulled from the resource collection.`;
}

function buildExplanation(category, relativePath, title, rawSource = "") {
  const section = humanizeSegment(path.dirname(relativePath).split(path.sep).pop() || category);

  if (/\.html?$/i.test(relativePath)) {
    const signals = extractHtmlSignals(rawSource);
    const visibleFocus = firstNonGeneric(signals.h1, signals.h2, signals.h3, signals.button);
    if (visibleFocus) {
      return `This page demonstrates ${title}. The main visible focus is "${visibleFocus}", and the example is meant to help you connect the rendered UI with the code that produces it.`;
    }
  }

  if (/express/i.test(category) && /next\(\)/.test(rawSource)) {
    return "This lesson shows how Express middleware sits in the request pipeline, runs before the final route handler, and passes control forward with next().";
  }
  if (/express/i.test(category) && /express\.Router/.test(rawSource)) {
    return "This lesson shows how an Express app becomes easier to manage by splitting related routes into dedicated router modules.";
  }
  if (/node/i.test(category) && /createServer/.test(rawSource)) {
    return "This lesson shows a raw Node HTTP server so you can understand request and response handling before adding frameworks like Express.";
  }
  if (/react/i.test(category) && /useState/.test(rawSource)) {
    return "This lesson shows a React stateful component. The important thing to notice is that updating state triggers a rerender and changes what appears on screen.";
  }
  if (/ajax/i.test(category) && /XMLHttpRequest|fetch\(/.test(rawSource)) {
    return "This lesson shows asynchronous data loading. The page stays open while JavaScript requests data and updates the UI after the response arrives.";
  }
  if (/javascript/i.test(category) && /console\.log/.test(rawSource)) {
    return "This lesson is mainly about observing JavaScript behavior through the console, so the preview and console output should be read together.";
  }

  return `This lesson is part of the ${section} section. It is meant to help you understand what this page does by comparing the rendered output with the underlying ${category.toLowerCase()} code.`;
}

function makeHtmlTopic(category, relativePath, options = {}) {
  const rawSource = readText(relativePath);
  let title = options.title || inferTitle(relativePath, category, rawSource);
  if (isWeakTitle(title)) {
    const parent = humanizeLabel(path.dirname(relativePath).split(path.sep).pop() || category);
    title = `${parent} Concept`;
  }
  return {
    id: `resource-${category.toLowerCase()}-${relativePath.replace(/[\\/.\s]+/g, "-").toLowerCase()}`,
    title,
    summary: options.summary || buildSummary(category, relativePath, title),
    explanation: options.explanation || buildExplanation(category, relativePath, title, rawSource),
    points: options.points || buildGenericPoints(category, relativePath, title),
    files: extractHtmlExample(relativePath, options.extractOptions)
  };
}

function makeJsTopic(category, relativeScripts, options = {}) {
  const primary = relativeScripts[0];
  const rawSource = relativeScripts.map((file) => readText(file)).join("\n\n");
  let title = options.title || inferTitle(primary, category, rawSource);
  if (isWeakTitle(title)) {
    const parent = humanizeLabel(path.dirname(primary).split(path.sep).pop() || category);
    title = `${parent} Code Walkthrough`;
  }
  return {
    id: `resource-${category.toLowerCase()}-${primary.replace(/[\\/.\s]+/g, "-").toLowerCase()}`,
    title,
    summary: options.summary || buildSummary(category, primary, title),
    explanation: options.explanation || buildExplanation(category, primary, title, rawSource),
    points: options.points || buildGenericPoints(category, primary, title),
    files: createJsOnlyTopic(
      options.previewHtml ||
        `<section style="font-family: Arial, sans-serif; padding: 24px;">
  <h2>${title}</h2>
  <p>This lesson focuses on source code behavior. Use the code panel and preview console together.</p>
</section>`,
      options.previewCss || "body { background: #eef6ff; color: #18344c; }",
      relativeScripts
    )
  };
}

function mergeTopics(existing, incoming) {
  const seen = new Set(existing.map((topic) => topic.id));
  for (const topic of incoming) {
    if (!seen.has(topic.id)) {
      existing.push(topic);
      seen.add(topic.id);
    }
  }
  return existing;
}

function buildHtmlTopics() {
  const topics = [];

  mergeTopics(topics, listFiles("Day01", /^page\d+\.html$/i).map((file) => makeHtmlTopic("HTML", file)));
  mergeTopics(topics, listFiles("Day02", /^page\d+\.html$/i).map((file) => makeHtmlTopic("HTML", file)));
  mergeTopics(topics, listFiles("Day02/Demo05", /\.html$/i).map((file) => makeHtmlTopic("HTML", file)));

  return topics;
}

function buildCssTopics() {
  return listFilesRecursive("Day03", /^page\d+\.html$/i).map((file) => makeHtmlTopic("CSS", file));
}

function buildJavaScriptTopics() {
  const topics = [];

  mergeTopics(topics, listFiles("Day04/2.JSBasics", /^page\d+\.html$/i).map((file) => makeHtmlTopic("JavaScript", file)));
  mergeTopics(topics, listFiles("Day04/3.JSFunctions", /^page\d+\.html$/i).map((file) => makeHtmlTopic("JavaScript", file)));
  mergeTopics(topics, listFiles("Day04/4.JSFunctionDetails", /^page\d+\.html$/i).map((file) => makeHtmlTopic("JavaScript", file)));
  mergeTopics(topics, listFiles("Day05", /^page\d+\.html$/i).map((file) => makeHtmlTopic("JavaScript", file)));
  mergeTopics(topics, listFilesRecursive("Day05", /^page\d+\.html$/i).map((file) => makeHtmlTopic("JavaScript", file)));
  mergeTopics(topics, listFilesRecursive("Day06", /^page\d+\.html$/i).map((file) => makeHtmlTopic("JavaScript", file)));

  mergeTopics(
    topics,
    listFilesRecursive("Day04", /^demo\d+\.js$/i).map((file) => makeJsTopic("JavaScript", [file]))
  );
  mergeTopics(
    topics,
    listFilesRecursive("Day05", /^demo\d+\.js$/i).map((file) => makeJsTopic("JavaScript", [file]))
  );
  mergeTopics(
    topics,
    listFilesRecursive("Day06", /^demo\d+\.js$/i).map((file) => makeJsTopic("JavaScript", [file]))
  );

  return topics;
}

function buildAjaxTopics() {
  const topics = [];

  mergeTopics(
    topics,
    listFiles("Day07/1.FetchingDataFromLocalHost", /^page\d+\.html$/i).map((file) =>
      makeHtmlTopic("AJAX", file, {
        extractOptions: { inlineLocalScripts: true }
      })
    )
  );

  mergeTopics(
    topics,
    listFiles("Day07/2.FetchingDataFromThirdPartyServer", /^page\d+\.html$/i).map((file) =>
      makeHtmlTopic("AJAX", file, {
        extractOptions: { inlineLocalScripts: true }
      })
    )
  );

  mergeTopics(
    topics,
    listFiles("Day07/3.Promise", /^page\d+\.html$/i).map((file) =>
      makeHtmlTopic("AJAX", file, {
        extractOptions: { inlineLocalScripts: true }
      })
    )
  );

  mergeTopics(
    topics,
    ["Day07/3.Promise/callbackbasedlibrary.js", "Day07/3.Promise/promisebasedlibrary.js"].map((file) =>
      makeJsTopic("AJAX", [file], {
        previewHtml: `<section style="font-family: Arial, sans-serif; padding: 24px;">
  <h2>${inferTitle(file, "AJAX")}</h2>
  <p>This support library powers asynchronous data flow examples from the resources.</p>
</section>`,
        previewCss: "body { background: #eefafc; color: #133348; }"
      })
    )
  );

  return topics;
}

function buildReactTopics() {
  const topics = [];

  mergeTopics(
    topics,
    listFiles("Day11/2.PureReact", /^page\d+\.html$/i).map((file) =>
      makeHtmlTopic("React", file, {
        extractOptions: { replaceReactCdn: true }
      })
    )
  );

  mergeTopics(
    topics,
    [
      "Day11/app1/src/App.jsx",
      "Day11/app2/src/main01.jsx",
      "Day11/app2/src/main02.jsx",
      "Day11/app2/src/main03.jsx",
      "Day11/app2/src/main04.jsx",
      "Day11/app2/src/main05.jsx",
      "Day11/app2/src/main06.jsx",
      "Day11/app2/src/main07.jsx",
      "Day11/app2/src/main08.jsx",
      "Day11/app2/src/main09.jsx",
      "Day11/app3/src/main01.jsx",
      "Day11/app3/src/main02.jsx",
      "Day11/app4/src/components/Person.jsx",
      "Day11/app4/src/components/Employee.jsx",
      "Day12/1.Events_Props/src/components/Events.jsx",
      "Day12/1.Events_Props/src/components/EmployeeList.jsx",
      "Day12/1.Events_Props/src/components/Employee.jsx",
      "Day12/2.UseState Hook/src/components/Counter.jsx",
      "Day12/3.Navigation_Boootstrap/src/components/Navbar.jsx",
      "Day12/3.Navigation_Boootstrap/src/pages/Home.jsx",
      "Day12/3.Navigation_Boootstrap/src/pages/Aboutus.jsx",
      "Day12/3.Navigation_Boootstrap/src/pages/Login.jsx",
      "Day12/onlinefoodorder/src/components/Navbar.jsx",
      "Day12/onlinefoodorder/src/pages/Home.jsx",
      "Day12/onlinefoodorder/src/pages/Login.jsx",
      "Day12/onlinefoodorder/src/pages/Register.jsx",
      "Day12/onlinefoodorder/src/pages/Cart.jsx",
      "Day12/onlinefoodorder/src/pages/Orders.jsx",
      "Day12/onlinefoodorder/src/pages/Profile.jsx"
    ].map((file) =>
      makeJsTopic("React", [file], {
        previewHtml: `<section style="font-family: Arial, sans-serif; padding: 24px;">
  <h2>${inferTitle(file, "React")}</h2>
  <p>This is a JSX source example from the React lessons. Read the component code and compare it with the simpler runnable React examples nearby.</p>
</section>`,
        previewCss: "body { background: #fff6ff; color: #301b4a; }"
      })
    )
  );

  return topics;
}

function buildNodeTopics() {
  const topics = [];

  mergeTopics(
    topics,
    listFiles("Day07/4.Node", /^demo\d+\.js$/i).map((file) => makeJsTopic("Node", [file]))
  );
  mergeTopics(
    topics,
    listFiles("Day07/4.Node", /^math\d+\.js$/i).map((file) => makeJsTopic("Node", [file]))
  );
  mergeTopics(
    topics,
    listFiles("Day08/1.BuiltinModules", /^demo\d+\.js$/i).map((file) => makeJsTopic("Node", [file]))
  );
  mergeTopics(
    topics,
    listFiles("Day08/2.HTTP Server", /^server\d+\.js$/i).map((file) => makeJsTopic("Node", [file]))
  );

  return topics;
}

function buildExpressTopics() {
  const topics = [];

  mergeTopics(
    topics,
    [
      "Day08/3.UnderstandingExpress/server.js",
      "Day08/4.AddingRoutes/server.js",
      "Day08/5.SeperatingRoutes/server.js",
      "Day08/5.SeperatingRoutes/routes/user.js",
      "Day08/5.SeperatingRoutes/routes/product.js",
      "Day09/1.Middleware/server.js",
      "Day09/1.Middleware/routes/user.js",
      "Day09/1.Middleware/routes/product.js",
      "Day09/2.CRUDOperations/server.js",
      "Day09/2.CRUDOperations/route/user.js",
      "Day09/3.Signin_Signup/server.js",
      "Day09/3.Signin_Signup/routes/user.js",
      "Day09/4.Password_Hashing/server.js",
      "Day09/4.Password_Hashing/routes/user.js",
      "Day10/FoodOrderingServer/server.js",
      "Day10/FoodOrderingServer/routes/user.js",
      "Day10/FoodOrderingServer/routes/food.js",
      "Day12/FoodOrderingServer/server.js",
      "Day12/FoodOrderingServer/routes/user.js",
      "Day12/FoodOrderingServer/routes/food.js"
    ].map((file) => makeJsTopic("Express", [file]))
  );

  return topics;
}

function getResourceTopicGroups() {
  return [
    { category: "HTML", topics: buildHtmlTopics() },
    { category: "CSS", topics: buildCssTopics() },
    { category: "JavaScript", topics: buildJavaScriptTopics() },
    { category: "AJAX", topics: buildAjaxTopics() },
    { category: "React", topics: buildReactTopics() },
    { category: "Node", topics: buildNodeTopics() },
    { category: "Express", topics: buildExpressTopics() }
  ];
}

module.exports = {
  getResourceTopicGroups
};
