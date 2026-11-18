#!/usr/bin/env node

const fs = require("fs");

// Get target file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node format-mdx.js <target-file-path>");
  process.exit(1);
}

const filePath = args[0];

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`Error: File ${filePath} does not exist`);
  process.exit(1);
}

// Read the file
let content = fs.readFileSync(filePath, "utf8").replace(/\r\n?/g, "\n");

// Normalize line endings and excessive blank lines. Exactly one blank line
// means two newline characters, so repeated blank lines must never create
// additional spacing.
content = content.replace(/\n{3,}/g, "\n\n");

// Move any {/* Source: ... */} comments to after the H1 heading, with proper spacing
const lines = content.split("\n");

// Locate the end of frontmatter (second '---' line)
let frontmatterEnd = -1;
let dashCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "---") {
    dashCount++;
    if (dashCount === 2) {
      frontmatterEnd = i;
      break;
    }
  }
}

let afterFrontmatter = frontmatterEnd !== -1 ? lines.slice(frontmatterEnd + 1) : lines;

// Extract source comments once, then place them immediately after H1.
// Keeping this pass independent of blank-line handling prevents comments
// and surrounding prose from accumulating extra blank lines.
const commentLines = afterFrontmatter.filter(line =>
  /^\s*\{\/\* Source:/ .test(line),
);
const otherLines = afterFrontmatter.filter(line =>
  ! /^\s*\{\/\* Source:/ .test(line),
);
const h1Idx = otherLines.findIndex(line => line.trim().startsWith("# "));

let rebuilt = otherLines;
if (h1Idx !== -1) {
  rebuilt = otherLines.slice(0, h1Idx + 1);
  rebuilt.push("");
  if (commentLines.length > 0) {
    rebuilt = rebuilt.concat(commentLines);
    rebuilt.push("");
  }
  rebuilt = rebuilt.concat(otherLines.slice(h1Idx + 1));
} else if (commentLines.length > 0) {
  rebuilt = [...commentLines, "", ...otherLines];
}

// Reassemble with frontmatter if present
let finalLines = [];
if (frontmatterEnd !== -1) {
  finalLines = lines.slice(0, frontmatterEnd + 1).concat(rebuilt);
} else {
  finalLines = rebuilt;
}

content = finalLines.join("\n").replace(/\n{3,}/g, "\n\n");

// Final cleanup: ensure file ends with a single newline
content = content.trim() + "\n";

fs.writeFileSync(filePath, content);

console.log(`Successfully formatted ${filePath} according to MDX documentation standards`);
