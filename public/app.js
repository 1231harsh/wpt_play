const topicNav = document.getElementById("topic-nav");
const currentCategory = document.getElementById("current-category");
const currentTopic = document.getElementById("current-topic");
const currentSummary = document.getElementById("current-summary");
const learningPoints = document.getElementById("learning-points");
const topicExplanation = document.getElementById("topic-explanation");
const htmlEditor = document.getElementById("html-editor");
const cssEditor = document.getElementById("css-editor");
const jsEditor = document.getElementById("js-editor");
const previewFrame = document.getElementById("preview-frame");
const runBtn = document.getElementById("run-btn");
const resetBtn = document.getElementById("reset-btn");
const appShell = document.getElementById("app-shell");
const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");

let topicGroups = window.TOPIC_GROUPS || [];
const topicMap = new Map();
let activeTopicId = null;
let originalFiles = null;
let isSidebarCollapsed = false;
let collapsedGroups = new Set();

function buildNavigation() {
  topicMap.clear();
  topicNav.innerHTML = "";

  topicGroups.forEach((group) => {
    const wrapper = document.createElement("section");
    wrapper.className = "topic-group";
    if (collapsedGroups.has(group.category)) {
      wrapper.classList.add("collapsed");
    }

    const headerButton = document.createElement("button");
    headerButton.className = "topic-group-header";
    headerButton.type = "button";

    const heading = document.createElement("h3");
    heading.textContent = group.category;

    const headingMeta = document.createElement("div");
    const count = document.createElement("span");
    count.className = "topic-group-count";
    count.textContent = `${group.topics.length} topics`;
    headingMeta.appendChild(heading);
    headingMeta.appendChild(count);

    const caret = document.createElement("span");
    caret.className = "topic-group-caret";
    caret.textContent = "▾";

    headerButton.appendChild(headingMeta);
    headerButton.appendChild(caret);
    headerButton.addEventListener("click", () => toggleGroup(group.category));
    wrapper.appendChild(headerButton);

    const list = document.createElement("div");
    list.className = "topic-list";

    group.topics.forEach((topic) => {
      topicMap.set(topic.id, { ...topic, category: group.category });

      const button = document.createElement("button");
      button.className = "topic-btn";
      button.textContent = topic.title;
      button.dataset.topicId = topic.id;
      button.addEventListener("click", () => loadTopic(topic.id));
      list.appendChild(button);
    });

    wrapper.appendChild(list);
    topicNav.appendChild(wrapper);
  });
}

function setActiveButton(topicId) {
  document.querySelectorAll(".topic-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.topicId === topicId);
  });
}

function toggleGroup(category) {
  if (collapsedGroups.has(category)) {
    collapsedGroups.delete(category);
  } else {
    collapsedGroups.add(category);
  }

  buildNavigation();
  setActiveButton(activeTopicId);
}

function loadTopic(topicId) {
  const topic = topicMap.get(topicId);
  if (!topic) return;

  activeTopicId = topicId;
  originalFiles = { ...topic.files };
  collapsedGroups.delete(topic.category);

  currentCategory.textContent = topic.category;
  currentTopic.textContent = topic.title;
  currentSummary.textContent = topic.summary;
  topicExplanation.textContent = topic.explanation || topic.summary;
  htmlEditor.value = topic.files.html;
  cssEditor.value = topic.files.css;
  jsEditor.value = topic.files.js;

  learningPoints.innerHTML = "";
  topic.points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    learningPoints.appendChild(item);
  });

  buildNavigation();
  setActiveButton(topicId);
  renderPreview();
}

function renderPreview() {
  const previewConsoleScript = `
    <script>
      (function () {
        function ensureConsole() {
          let panel = document.getElementById("__lab_console__");
          if (panel) return panel;

          panel = document.createElement("div");
          panel.id = "__lab_console__";
          panel.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;max-height:180px;overflow:auto;background:rgba(5,10,20,0.92);color:#dff8ff;font:12px/1.5 Consolas,monospace;padding:10px 12px;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,0.22);z-index:99999;";

          const title = document.createElement("div");
          title.textContent = "Preview Console";
          title.style.cssText = "font-weight:700;margin-bottom:6px;color:#7be7ff;";
          panel.appendChild(title);
          document.body.appendChild(panel);
          return panel;
        }

        function writeLine(prefix, args) {
          try {
            const panel = ensureConsole();
            const line = document.createElement("div");
            line.textContent = prefix + args.map((arg) => {
              if (typeof arg === "string") return arg;
              try { return JSON.stringify(arg); } catch (_error) { return String(arg); }
            }).join(" ");
            panel.appendChild(line);
          } catch (_error) {
          }
        }

        const originalLog = console.log.bind(console);
        console.log = (...args) => {
          originalLog(...args);
          writeLine("> ", args);
          parent.postMessage({ type: "preview-log", payload: args.join(" ") }, "*");
        };

        window.addEventListener("error", (event) => {
          writeLine("Error: ", [event.message]);
        });
      })();
    <\/script>
  `;

  const htmlSource = htmlEditor.value.trim();
  const isFullDocument = /<html[\s>]|<!doctype|<head[\s>]|<body[\s>]/i.test(htmlSource);
  let srcDoc;

  if (isFullDocument) {
    const withStyles = /<\/head>/i.test(htmlSource)
      ? htmlSource.replace(/<\/head>/i, `<style>${cssEditor.value}</style></head>`)
      : `<style>${cssEditor.value}</style>${htmlSource}`;

    srcDoc = /<\/body>/i.test(withStyles)
      ? withStyles.replace(/<\/body>/i, `${previewConsoleScript}<script>${jsEditor.value}<\/script></body>`)
      : `${withStyles}${previewConsoleScript}<script>${jsEditor.value}<\/script>`;
  } else {
    srcDoc = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${cssEditor.value}</style>
        </head>
        <body>
          ${htmlEditor.value}
          ${previewConsoleScript}
          <script>${jsEditor.value}<\/script>
        </body>
      </html>
    `;
  }

  previewFrame.srcdoc = srcDoc;
}

function syncSidebarState() {
  appShell.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
  toggleSidebarBtn.textContent = isSidebarCollapsed ? "Show Topics" : "Hide Topics";
  toggleSidebarBtn.setAttribute("aria-expanded", String(!isSidebarCollapsed));
}

function toggleSidebar() {
  isSidebarCollapsed = !isSidebarCollapsed;
  syncSidebarState();
}

function resetExample() {
  if (!originalFiles) return;
  htmlEditor.value = originalFiles.html;
  cssEditor.value = originalFiles.css;
  jsEditor.value = originalFiles.js;
  renderPreview();
}

function mergeTopicGroups(baseGroups, extraGroups) {
  const groupMap = new Map(
    baseGroups.map((group) => [
      group.category,
      {
        category: group.category,
        topics: [...group.topics]
      }
    ])
  );

  extraGroups.forEach((group) => {
    if (!groupMap.has(group.category)) {
      groupMap.set(group.category, {
        category: group.category,
        topics: [...group.topics]
      });
      return;
    }

    groupMap.get(group.category).topics.push(...group.topics);
  });

  return [...groupMap.values()];
}

function loadAllTopics() {
  const generatedGroups = window.GENERATED_TOPIC_GROUPS || [];
  if (generatedGroups.length > 0) {
    topicGroups = mergeTopicGroups(window.TOPIC_GROUPS || [], generatedGroups);
  } else {
    console.error("Generated topic catalog script was not available. Falling back to starter lessons.");
    topicGroups = window.TOPIC_GROUPS || [];
    currentSummary.textContent = "Expanded topic catalog could not be loaded, so the starter lessons are being shown.";
  }

  collapsedGroups = new Set(topicGroups.map((group) => group.category));
  buildNavigation();
  loadTopic(activeTopicId || topicGroups[0]?.topics[0]?.id || "html-table");
}

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".editor-block").forEach((block) => block.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`.editor-block[data-editor="${button.dataset.tab}"]`).classList.add("active");
  });
});

runBtn.addEventListener("click", renderPreview);
resetBtn.addEventListener("click", resetExample);
toggleSidebarBtn.addEventListener("click", toggleSidebar);

syncSidebarState();
loadAllTopics();
