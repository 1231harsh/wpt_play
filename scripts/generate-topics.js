const fs = require("fs");
const path = require("path");
const { getResourceTopicGroups } = require("../resourceTopics");

const outputPath = path.join(__dirname, "..", "public", "generated-topics.json");

fs.writeFileSync(
  outputPath,
  JSON.stringify({ groups: getResourceTopicGroups() }, null, 2),
  "utf8"
);

console.log(`Generated topic catalog at ${outputPath}`);
