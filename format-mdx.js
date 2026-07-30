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
let content = fs.readFileSync(filePath, "utf8");

// First, normalize excessive empty lines (3 or more consecutive newlines to 2)
content = content.replace(/\n{3,}/g, "\n\n");

// Ensure proper spacing around headers
content = content.replace(/([^#\n])(\n)(##)/g, "$1\n\n$3");
content = content.replace(/([^#\n])(\n)(###)/g, "$1\n\n$3");

// Ensure proper spacing around code blocks
content = content.replace(/([^\n])(\n)(```)/g, "$1\n\n$3"); // Space before code block
content = content.replace(/(```)(\n)([^\n])/g, "$1\n\n$3"); // Space after code block

// Handle code block internals carefully
// Find each code block and fix its internal formatting
content = content.replace(
  /(```[\w\s-]+)\n(.*?)(\n+)```/gs,
  (match, start, innerContent, trailingNewlines) => {
    // Clean the inner content
    let cleaned = innerContent;

    // Remove leading empty lines from inside the code block
    cleaned = cleaned.replace(/^\n+/, "");

    // Remove trailing empty lines from inside the code block
    cleaned = cleaned.replace(/\n+$/, "");

    // Don't add extra newline - content should end directly before closing fence
    return start + "\n" + cleaned + "\n```";
  },
);

// Also handle the case where there's no content between fences
content = content.replace(/(```\w+\n)\n*(```)/g, "$1$2");

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

// Find first H1 line (starts with '# ') in afterFrontmatter
const h1Idx = afterFrontmatter.findIndex(l => l.trim().startsWith("# "));

// Separate comment lines and other lines
const commentLines = [];
const otherLines = [];
for (const line of afterFrontmatter) {
  if (/^\s*{\/\* Source:/ .test(line)) {
    commentLines.push(line);
  } else {
    otherLines.push(line);
  }
}

let rebuilt = [];
if (h1Idx !== -1) {
  // Include everything up to and including the H1 line
  rebuilt = otherLines.slice(0, h1Idx + 1);
  // Ensure a blank line after H1 before comments
  if (rebuilt[rebuilt.length - 1].trim() !== "") {
    rebuilt.push("");
  }
  // Insert comment lines
  rebuilt = rebuilt.concat(commentLines);
  // Ensure a blank line after comments before the remaining content
  if (commentLines.length > 0) {
    rebuilt.push("");
  }
  // Append the rest of the content after H1
  rebuilt = rebuilt.concat(otherLines.slice(h1Idx + 1));
} else {
  // No H1 – just prepend comments
  rebuilt = commentLines.concat([""], otherLines);
}

// Reassemble with frontmatter if present
let finalLines = [];
if (frontmatterEnd !== -1) {
  finalLines = lines.slice(0, frontmatterEnd + 1).concat(rebuilt);
} else {
  finalLines = rebuilt;
}

content = finalLines.join("\n");

// Final cleanup: ensure file ends with a single newline
content = content.trim() + "\n";

fs.writeFileSync(filePath, content);

console.log(`Successfully formatted ${filePath} according to MDX documentation standards`);
