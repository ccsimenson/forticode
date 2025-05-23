#!/usr/bin/env node

const fs = require('fs');
const { writeFile } = require('fs/promises');
const path = require('path');
const { execSync } = require('child_process');

// Helper functions
const existsSync = fs.existsSync;
const mkdirSync = fs.mkdirSync;
const join = path.join;

const projectRoot = path.join(__dirname, '..');
const srcMainPath = path.join(projectRoot, 'src/main');
const distPath = path.join(projectRoot, 'dist');
const mainDistPath = path.join(distPath, 'main');

console.log('Starting build process...');

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });
fs.mkdirSync(mainDistPath, { recursive: true });

console.log('Compiling TypeScript...');
try {
    // Compile TypeScript using the existing tsconfig.main.json
    execSync('npx tsc -p tsconfig.main.json --pretty', {
        stdio: 'inherit',
        cwd: projectRoot
    });
    
    // Run tsc-alias to resolve path aliases
    console.log('Resolving path aliases...');
    execSync('npx tsc-alias -p tsconfig.main.json', {
        stdio: 'inherit',
        cwd: projectRoot
    });
    
        // Verify output directory
    console.log('Verifying output directory...');
    const outputFiles = fs.readdirSync(join(__dirname, '../dist/main'), { withFileTypes: true });
    console.log('Output files:', outputFiles.map(f => f.name).join(', '));
    
    // Copy modules directory to dist
    console.log('Copying modules directory...');
    const srcModulesPath = join(projectRoot, 'src/modules');
    const destModulesPath = join(distPath, 'modules');
    if (fs.existsSync(srcModulesPath)) {
        if (!fs.existsSync(destModulesPath)) {
            fs.mkdirSync(destModulesPath, { recursive: true });
        }
        copyDirSync(srcModulesPath, destModulesPath);
    }
    
    // Copy shared directory to dist
    console.log('Copying shared directory...');
    const srcSharedPath = join(projectRoot, 'src/shared');
    const destSharedPath = join(distPath, 'shared');
    if (fs.existsSync(srcSharedPath)) {
        if (!fs.existsSync(destSharedPath)) {
            fs.mkdirSync(destSharedPath, { recursive: true });
        }
        copyDirSync(srcSharedPath, destSharedPath);
    }
    
    // Verify final output
    console.log('Final output files:');
    const finalFiles = fs.readdirSync(join(__dirname, '../dist/main'), { withFileTypes: true, recursive: true });
    finalFiles.forEach(file => {
        console.log(`- ${file.path}\\${file.name}${file.isDirectory() ? ' (dir)' : ''}`);
    });
    
    // Then, move files from dist/main/main to dist/main if needed
    const mainSubDir = join(mainDistPath, 'main');
    if (existsSync(mainSubDir)) {
        console.log('Moving files from dist/main/main to dist/main...');
        const files = fs.readdirSync(mainSubDir, { withFileTypes: true });
        
        for (const file of files) {
            const srcPath = join(mainSubDir, file.name);
            const destPath = join(mainDistPath, file.name);
            
            if (file.isDirectory()) {
                // For directories, we need to copy their contents
                copyDirSync(srcPath, destPath);
                require('rimraf').sync(srcPath);
            } else {
                // For files, just move them
                fs.renameSync(srcPath, destPath);
            }
        }
        
        // Remove the now-empty directory
        fs.rmdirSync(mainSubDir);
    }
    
    console.log('TypeScript compilation completed successfully');
} catch (error) {
    console.error('TypeScript compilation failed:', error);
    process.exit(1);
}

// Create package.json for main process
const packageJson = {
    name: 'forticode-main',
    version: '1.0.0',
    main: 'index.js',
    type: 'commonjs',
    dependencies: {
        'electron': require('../package.json').dependencies.electron || '^28.1.0'
    }
};

// Write package.json to dist/main
const packageJsonPath = join(mainDistPath, 'package.json');
writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
    .then(() => console.log('Created package.json in dist/main'))
    .catch(err => {
        console.error('Failed to create package.json:', err);
        process.exit(1);
    });

// Copy any additional files needed
const filesToCopy = ['preload.js'];

async function copyFiles() {
    for (const file of filesToCopy) {
        const src = join(srcMainPath, file);
        const dest = join(mainDistPath, file);
        if (existsSync(src)) {
            await fs.copyFile(src, dest);
            console.log(`Copied ${file} to dist/main`);
        }
    }
}

copyFiles().catch(err => {
    console.error('Error copying files:', err);
    process.exit(1);
});

// Move files from dist/main/main to dist/main
async function moveFilesUp() {
    const sourceDir = join(mainDistPath, 'main');
    if (!existsSync(sourceDir)) return;

    const files = await fs.readdir(sourceDir, { withFileTypes: true });
    
    for (const file of files) {
        const sourcePath = join(sourceDir, file.name);
        const destPath = join(mainDistPath, file.name);
        
        if (file.isDirectory()) {
            // For directories, we need to move their contents
            await copyDir(sourcePath, destPath);
            await removeDir(sourcePath);
        } else {
            // For files, just move them
            await fs.copyFile(sourcePath, destPath);
            await fs.unlink(sourcePath);
        }
    }
    
    // Remove the now-empty directory
    await fs.rmdir(sourceDir);
}

async function copyDir(src, dest) {
    if (!existsSync(dest)) {
        await fs.mkdir(dest, { recursive: true });
    }
    
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

async function removeDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const entryPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
            await removeDir(entryPath);
        } else {
            await fs.unlink(entryPath);
        }
    }
    
    await fs.rmdir(dir);
}

// Helper function to copy directories synchronously
function copyDirSync(src, dest) {
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Execute the file movement
moveFilesUp().catch(console.error);
