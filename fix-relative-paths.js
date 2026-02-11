const path = require('path');
const fs = require('fs');

// Base directory
const baseDir = __dirname; // This is the directory where the script is running, which should be /home/simon/dev/tango-adb/docs

// Define the mappings of source files to target files
const linkMappings = [
    {
        sourceFile: 'docs/scrcpy/connect-server.mdx',
        targetFile: 'docs/scrcpy/options/v2.1/video.mdx',
        oldLink: './options/video.mdx',
        newLink: ''
    },
    {
        sourceFile: 'docs/scrcpy/control/screen-power.mdx', 
        targetFile: 'docs/scrcpy/options/v1.23/cleanup.mdx',
        oldLink: '../options/cleanup.mdx',
        newLink: ''
    },
    {
        sourceFile: 'docs/scrcpy/start-server.mdx',
        targetFile: 'docs/scrcpy/options/v2.1/video.mdx', 
        oldLink: './options/video.mdx',
        newLink: ''
    }
];

// Calculate correct relative paths
linkMappings.forEach(mapping => {
    // Calculate path from source file directory to target file
    const sourceDir = path.dirname(path.join(baseDir, mapping.sourceFile));
    const targetPath = path.join(baseDir, mapping.targetFile);
    const relativePath = path.relative(sourceDir, targetPath).replace(/\\/g, '/');
    
    mapping.newLink = relativePath;
    console.log(`${mapping.sourceFile} -> ${mapping.targetFile}: ${relativePath}`);
});

// Now update the files
linkMappings.forEach(mapping => {
    const filePath = path.join(baseDir, mapping.sourceFile);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace old link with new link
        const updatedContent = content.replace(
            new RegExp(mapping.oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            mapping.newLink
        );
        
        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent);
            console.log(`Updated ${path.basename(mapping.sourceFile)}: ${mapping.oldLink} -> ${mapping.newLink}`);
        } else {
            console.log(`No changes needed for ${path.basename(mapping.sourceFile)} (link not found: ${mapping.oldLink})`); 
        }
    } else {
        console.log(`File does not exist: ${filePath}`);
    }
});

// Handle the other links that need fixing
const otherLinkMappings = [
    {
        sourceFile: 'docs/scrcpy/video/index.mdx',
        targetFile: 'docs/scrcpy/video/webcodecs/index.mdx',
        oldLink: './web-codecs.mdx',
        newLink: ''
    },
    {
        sourceFile: 'docs/scrcpy/video/record.mdx',
        targetFile: 'docs/scrcpy/video/webcodecs/index.mdx',
        oldLink: './web-codecs.mdx#create-a-renderer',
        newLink: ''
    }
];

otherLinkMappings.forEach(mapping => {
    // Calculate path from source file directory to target file
    const sourceDir = path.dirname(path.join(baseDir, mapping.sourceFile));
    const targetPath = path.join(baseDir, mapping.targetFile);
    const relativePath = path.relative(sourceDir, targetPath).replace(/\\/g, '/');
    
    mapping.newLink = relativePath;
    console.log(`${mapping.sourceFile} -> ${mapping.targetFile}: ${relativePath}`);
    
    const filePath = path.join(baseDir, mapping.sourceFile);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace old link with new link
        const updatedContent = content.replace(
            new RegExp(mapping.oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            mapping.newLink
        );
        
        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent);
            console.log(`Updated ${path.basename(mapping.sourceFile)}: ${mapping.oldLink} -> ${mapping.newLink}`);
        } else {
            console.log(`No changes needed for ${path.basename(mapping.sourceFile)} (link not found: ${mapping.oldLink})`);
        }
    } else {
        console.log(`File does not exist: ${filePath}`);
    }
});