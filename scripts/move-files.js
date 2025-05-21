const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const rename = promisify(fs.rename);

async function moveFilesUp() {
    const sourceDir = path.join(__dirname, '..', 'dist', 'main', 'main');
    const targetDir = path.join(__dirname, '..', 'dist', 'main');

    try {
        // Check if source directory exists
        if (!fs.existsSync(sourceDir)) {
            console.log('Source directory does not exist:', sourceDir);
            return;
        }

        console.log(`Moving files from ${sourceDir} to ${targetDir}`);

        // Move all files and directories from source to target
        const items = await readdir(sourceDir);
        
        for (const item of items) {
            const sourcePath = path.join(sourceDir, item);
            const targetPath = path.join(targetDir, item);
            
            // If the target already exists, we need to handle it carefully
            if (fs.existsSync(targetPath)) {
                console.log(`Skipping ${item} as it already exists in target`);
                continue;
            }
            
            console.log(`Moving ${item}...`);
            await rename(sourcePath, targetPath);
        }

        // Remove the now empty directory
        await rmdir(sourceDir);
        console.log('Successfully moved files and cleaned up directory');
        
    } catch (error) {
        console.error('Error moving files:', error);
        process.exit(1);
    }
}

// Run the function
moveFilesUp();
