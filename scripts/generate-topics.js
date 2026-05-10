const fs = require("fs");
const path = require("path");

const resourcesRoot = path.join(__dirname, "..", "resources", "wpt");
const outputPath = path.join(__dirname, "..", "public", "generated-topics.json");

if (!fs.existsSync(resourcesRoot)) {
  if (fs.existsSync(outputPath)) {
    console.log(`Resources not found at ${resourcesRoot}. Keeping existing topic catalog at ${outputPath}`);
    process.exit(0);
  }

  throw new Error(`Resources not found at ${resourcesRoot} and no existing topic catalog is available.`);
}

const { getResourceTopicGroups } = require("../resourceTopics");

fs.writeFileSync(outputPath, JSON.stringify({ groups: getResourceTopicGroups() }, null, 2), "utf8");

console.log(`Generated topic catalog at ${outputPath}`);
