#!/usr/bin/env node

const { writeFile, readdir, copyFile, unlink, rmdir } = require('fs/promises');
const { join, dirname } = require('path');
const { execSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');

// Define paths
const distPath = join(__dirname, '../dist');
const mainDistPath = join(distPath, 'main');
const srcMainPath = join(__dirname, '../src/main');

console.log('Cleaning dist directory...');
if (existsSync(distPath)) {
    require('rimraf').sync(distPath);
}

// Create fresh directories
mkdirSync(distPath, { recursive: true });
mkdirSync(mainDistPath, { recursive: true });

console.log('Compiling TypeScript...');
try {
    // Compile TypeScript with specific configuration
    execSync('npx tsc -p tsconfig.main.json --outDir dist/main --rootDir src --module commonjs --target es2020 --moduleResolution node', { 
        stdio: 'inherit',
        cwd: __dirname + '/..' 
    });
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
            await copyFile(src, dest);
            console.log(`Copied ${file} to dist/main`);
        }
    }
}

copyFiles().catch(err => {
    console.error('Error copying files:', err);
    process.exit(1);
});

// Write package.json
writeFile(join(mainDistPath, 'package.json'), JSON.stringify(packageJson, null, 2))
    .catch(err => console.error('Error creating main process package.json:', err));

// Move files from dist/main/main to dist/main
async function moveFilesUp() {
    const sourceDir = join(mainDistPath, 'main');
    if (!existsSync(sourceDir)) return;

    const files = await readdir(sourceDir, { withFileTypes: true });
    
    for (const file of files) {
        const sourcePath = join(sourceDir, file.name);
        const destPath = join(mainDistPath, file.name);
        
        if (file.isDirectory()) {
            // For directories, we need to move their contents
            await copyDir(sourcePath, destPath);
            await removeDir(sourcePath);
        } else {
            // For files, just move them
            await copyFile(sourcePath, destPath);
            await unlink(sourcePath);
        }
    }
    
    // Remove the now-empty directory
    await rmdir(sourceDir);
}

async function copyDir(src, dest) {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await copyFile(srcPath, destPath);
        }
    }
}

async function removeDir(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            await removeDir(fullPath);
        } else {
            await unlink(fullPath);
        }
    }
    
    await rmdir(dir);
}

// Execute the file movement
moveFilesUp().catch(console.error);
