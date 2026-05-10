const fs = require("fs");
const path = require("path");

const resourcesRoot = path.join(__dirname, "..", "resources", "wpt");
const jsonOutputPath = path.join(__dirname, "..", "public", "generated-topics.json");
const jsOutputPath = path.join(__dirname, "..", "public", "generated-topics.js");

function writeGeneratedCatalog(groups) {
  fs.writeFileSync(jsonOutputPath, JSON.stringify({ groups }, null, 2), "utf8");
  fs.writeFileSync(jsOutputPath, `window.GENERATED_TOPIC_GROUPS = ${JSON.stringify(groups, null, 2)};\n`, "utf8");
}

if (!fs.existsSync(resourcesRoot)) {
  if (fs.existsSync(jsonOutputPath) && fs.existsSync(jsOutputPath)) {
    console.log(`Resources not found at ${resourcesRoot}. Keeping existing topic catalogs.`);
    process.exit(0);
  }

  throw new Error(`Resources not found at ${resourcesRoot} and no existing topic catalogs are available.`);
}

const { getResourceTopicGroups } = require("../resourceTopics");
const groups = getResourceTopicGroups();

writeGeneratedCatalog(groups);

console.log(`Generated topic catalogs at ${jsonOutputPath} and ${jsOutputPath}`);
