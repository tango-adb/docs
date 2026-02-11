#!/usr/bin/env node

const fs = require('fs');

// Get target file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node format-mdx.js <target-file-path>');
    process.exit(1);
}

const filePath = args[0];

// Check if file exists
if (!fs.existsSync(filePath)) {
    console.error(`Error: File ${filePath} does not exist`);
    process.exit(1);
}

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// First, normalize excessive empty lines (3 or more consecutive newlines to 2)
content = content.replace(/\n{3,}/g, '\n\n');

// Ensure proper spacing around headers  
content = content.replace(/([^#\n])(\n)(##)/g, '$1\n\n$3');
content = content.replace(/([^#\n])(\n)(###)/g, '$1\n\n$3');

// Ensure proper spacing around code blocks
content = content.replace(/([^\n])(\n)(```)/g, '$1\n\n$3');  // Space before code block
content = content.replace(/(```)(\n)([^\n])/g, '$1\n\n$3');  // Space after code block

// Handle code block internals carefully
// Find each code block and fix its internal formatting
content = content.replace(/(```\w+.*?)\n(\s*)\n(.*?)(\n\s*)```/gs, (match, start, leadingSpace, innerContent, trailingSpace) => {
    // Clean the inner content
    let cleaned = innerContent;
    
    // Remove leading empty lines from inside the code block
    cleaned = cleaned.replace(/^\n+/, '');
    
    // Remove trailing empty lines from inside the code block
    cleaned = cleaned.replace(/\n+$/, '');
    
    // Add back exactly one newline before the closing fence, if there was content
    if (cleaned) {
        cleaned = cleaned + '\n';
    }
    
    return start + '\n' + cleaned + '```';
});

// Also handle the case where there's no content between fences
content = content.replace(/(```\w+\n)\n*(```)/g, '$1$2');

// Final cleanup
content = content.trim() + '\n';

// Write the file back
fs.writeFileSync(filePath, content);

console.log(`Successfully formatted ${filePath} according to MDX documentation standards`);