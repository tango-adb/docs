const path = require('path');
const fs = require('fs');

// Base directory
const baseDir = __dirname; // /home/simon/dev/tango-adb/docs

// Check the specific files that had broken links
const filesToCheck = [
    'docs/scrcpy/connect-server.mdx',
    'docs/scrcpy/control/screen-power.mdx',
    'docs/scrcpy/start-server.mdx',
    'docs/scrcpy/video/index.mdx',
    'docs/scrcpy/video/record.mdx'
];

filesToCheck.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`ERROR: File does not exist: ${filePath}`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find all markdown links with .mdx extensions
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const linkMatches = [...line.matchAll(/\[([^\]]*)\]\(([^)]*\.mdx[^)]*)\)/g)];
        
        for (const match of linkMatches) {
            const fullMatch = match[0];
            let linkPath = match[2];
            
            // Extract anchor if present
            const anchorSplit = linkPath.split('#');
            linkPath = anchorSplit[0];
            
            // Resolve relative to source file directory
            const sourceDir = path.dirname(path.join(baseDir, file));
            const resolvedPath = path.resolve(sourceDir, linkPath);
            
            // Check if target file exists
            if (!fs.existsSync(resolvedPath)) {
                console.log(`BROKEN LINK in ${file}:${i+1} (${fullMatch}): ${resolvedPath}`);
            }
        }
    }
});

console.log('Link checking complete.');