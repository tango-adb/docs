const fs = require('fs');
const path = require('path');

// Define the correct chronological order of Scrcpy options by when they were FIRST introduced
const optionPositions = {
    'option-value.mdx': 1,           // Foundational concept
    'log-level.mdx': 2,              // v1.15
    'max-size.mdx': 3,               // v1.15
    'bit-rate.mdx': 4,               // v1.15
    'max-fps.mdx': 5,                // v1.15
    'lock-video-orientation.mdx': 6, // v1.15 (first introduced)
    'tunnel-forward.mdx': 7,         // v1.15
    'crop.mdx': 8,                   // v1.15
    'send-frame-meta.mdx': 9,        // v1.15
    'control.mdx': 10,               // v1.15
    'display-id.mdx': 11,            // v1.15
    'show-touches.mdx': 12,          // v1.15
    'stay-awake.mdx': 13,            // v1.15
    'codec-options.mdx': 14,         // v1.15
    'encoder-name.mdx': 15,          // v1.17
    'power-off-on-close.mdx': 16,    // v1.18
    'clipboard-autosync.mdx': 17,    // v1.21
    'downsize-on-error.mdx': 18,     // v1.22
    'send-device-meta.mdx': 19,      // v1.22
    'send-dummy-byte.mdx': 20,       // v1.22
    'cleanup.mdx': 21,               // v1.23
    'power-on.mdx': 22,              // v1.24
    'scid.mdx': 23,                  // v2.0
    'video-codec.mdx': 24,           // v2.0
    'video-bit-rate.mdx': 25,        // v2.0
    'video-codec-options.mdx': 26,   // v2.0
    'video-encoder.mdx': 27,         // v2.0
    'audio.mdx': 28,                 // v2.0
    'audio-codec.mdx': 29,           // v2.0 (first introduced)
    'audio-bit-rate.mdx': 30,        // v2.0
    'audio-codec-options.mdx': 31,   // v2.0
    'audio-encoder.mdx': 32,         // v2.0
    'list-encoders.mdx': 33,         // v2.0
    'list-displays.mdx': 34,         // v2.0
    'send-codec-meta.mdx': 35,       // v2.0
    'audio-source.mdx': 36,          // v2.1 (first introduced)
    'video.mdx': 37,                 // v2.1
    'video-source.mdx': 38,          // v2.2
    'camera-id.mdx': 39,             // v2.2
    'camera-size.mdx': 40,           // v2.2
    'camera-facing.mdx': 41,         // v2.2
    'camera-ar.mdx': 42,             // v2.2
    'camera-fps.mdx': 43,            // v2.2
    'camera-high-speed.mdx': 44,     // v2.2
    'list-cameras.mdx': 45,          // v2.2
    'list-camera-sizes.mdx': 46,     // v2.2
    'audio-dup.mdx': 47,             // v2.6 (first introduced)
    'capture-orientation.mdx': 48,   // v3.0 (first introduced)
    'angle.mdx': 49,                 // v3.0
    'screen-off-timeout.mdx': 50,    // v3.0
    'list-apps.mdx': 51,             // v3.0
    'new-display.mdx': 52,           // v3.0
    'vd-system-decorations.mdx': 53, // v3.0
    'vd-destroy-content.mdx': 54,    // v3.1
    'display-ime-policy.mdx': 55,    // v3.2
    'inheritance.mdx': 56,           // Advanced topic (at the end)
};

// Directory containing the MDX files
const dirPath = '.';

// Get all .mdx files in the directory
const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.mdx'));

// Process each file
for (const file of files) {
    if (optionPositions[file] !== undefined) {
        const filePath = path.join(dirPath, file);
        console.log(`Updating ${file} to position ${optionPositions[file]}`);
        
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace or add the sidebar_position
        if (content.includes('sidebar_position:')) {
            // Update existing sidebar_position
            const updatedContent = content.replace(
                /(\s*)sidebar_position:\s*\d+(\s*)/,
                `$1sidebar_position: ${optionPositions[file]}$2`
            );
            
            // Write the updated content back to the file
            fs.writeFileSync(filePath, updatedContent);
        } else {
            // Add sidebar_position if it doesn't exist
            const lines = content.split('\n');
            if (lines[0].startsWith('---')) {
                // Insert sidebar_position after the first ---
                lines.splice(1, 0, `sidebar_position: ${optionPositions[file]}`);
                const updatedContent = lines.join('\n');
                fs.writeFileSync(filePath, updatedContent);
            }
        }
        
        console.log(`✓ Updated ${file}`);
    }
}

console.log('\nAll applicable sidebar positions updated successfully!');