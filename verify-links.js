const path = require('path');
const fs = require('fs');

// Current working directory is docs/
const baseDir = process.cwd(); // /home/simon/dev/tango-adb/docs

// Define the source files and what they're linking to
const linkChecks = [
    {
        sourceFile: 'docs/scrcpy/connect-server.mdx',
        currentLink: '../options/v2.1/video.mdx',
        expectedTarget: 'docs/scrcpy/options/v2.1/video.mdx'
    },
    {
        sourceFile: 'docs/scrcpy/control/screen-power.mdx',
        currentLink: '../../options/v1.23/cleanup.mdx',
        expectedTarget: 'docs/scrcpy/options/v1.23/cleanup.mdx'
    },
    {
        sourceFile: 'docs/scrcpy/start-server.mdx',
        currentLink: '../options/v2.1/video.mdx',
        expectedTarget: 'docs/scrcpy/options/v2.1/video.mdx'
    },
    {
        sourceFile: 'docs/scrcpy/video/index.mdx',
        currentLink: './webcodecs/index.mdx',
        expectedTarget: 'docs/scrcpy/video/webcodecs/index.mdx'
    },
    {
        sourceFile: 'docs/scrcpy/video/record.mdx',
        currentLink: './webcodecs/index.mdx#create-a-renderer',
        expectedTarget: 'docs/scrcpy/video/webcodecs/index.mdx'
    }
];

console.log('Checking if links resolve correctly...\n');

linkChecks.forEach(check => {
    const sourcePath = path.join(baseDir, check.sourceFile);
    const currentLink = check.currentLink.split('#')[0]; // Remove anchor for file check
    
    // Calculate what the target file path should be based on the current link
    const sourceDir = path.dirname(sourcePath);
    const targetPath = path.join(sourceDir, currentLink);
    
    console.log(`Checking ${check.sourceFile}:`);
    console.log(`  Current link: ${check.currentLink}`);
    console.log(`  Calculated target path: ${targetPath}`);
    console.log(`  Expected target file: ${path.join(baseDir, check.expectedTarget)}`);
    
    // Check if the target file exists
    const targetExists = fs.existsSync(targetPath);
    console.log(`  Target exists: ${targetExists}`);
    
    if (!targetExists) {
        console.log(`  ERROR: Target does not exist!`);
        
        // Try to calculate the correct path
        const correctPath = path.relative(sourceDir, path.join(baseDir, check.expectedTarget)).replace(/\\/g, '/');
        console.log(`  Suggested fix: ${correctPath}`);
    }
    
    console.log('');
});