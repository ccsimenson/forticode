#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const srcMainPath = path.join(projectRoot, 'src/main');
const distPath = path.join(projectRoot, 'dist');

console.log('Starting build process...');
console.log('Project root:', projectRoot);
console.log('Source main path:', srcMainPath);
console.log('Dist path:', distPath);

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync(distPath)) {
    console.log('Removing existing dist directory...');
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('Dist directory removed');
} else {
    console.log('No existing dist directory found');
}
console.log('Creating new dist directory...');
fs.mkdirSync(distPath, { recursive: true });
console.log('Dist directory created at:', distPath);

// Verify directory was created
if (!fs.existsSync(distPath)) {
    console.error('Failed to create dist directory at:', distPath);
    process.exit(1);
}

// Create main dist directory
const mainDistPath = path.join(distPath, 'main');
fs.mkdirSync(mainDistPath, { recursive: true });
console.log('Main dist directory:', mainDistPath);

// Create shared directory in dist
const sharedDestPath = path.join(distPath, 'shared');
fs.mkdirSync(sharedDestPath, { recursive: true });
console.log('Shared directory:', sharedDestPath);

// Copy shared files
const sharedSourcePath = path.join(projectRoot, 'src/shared');
if (fs.existsSync(sharedSourcePath)) {
    console.log('Copying shared files from:', sharedSourcePath);
    fs.cpSync(sharedSourcePath, sharedDestPath, { recursive: true });
    console.log('Shared files copied successfully');
} else {
    console.error('Shared source directory not found at:', sharedSourcePath);
    process.exit(1);
}

// Create a temporary tsconfig file with the correct paths
console.log('\n=== Creating temporary tsconfig ===');
const tsConfigPath = path.join(projectRoot, 'tsconfig.main-only.json');
const tempTsConfigPath = path.join(projectRoot, 'tsconfig.temp.json');

// Read the original tsconfig
const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

// Update the paths to work with the dist directory structure
tsConfig.compilerOptions.paths = {
    "@shared/*": ["../shared/*"]
};

// Write the temporary tsconfig
fs.writeFileSync(tempTsConfigPath, JSON.stringify(tsConfig, null, 2));
console.log('Temporary tsconfig created at:', tempTsConfigPath);

try {
    // Run TypeScript compiler with the temporary config
    console.log('\nRunning TypeScript compiler...');
    const tscCommand = `npx tsc -p ${tempTsConfigPath} --outDir ${mainDistPath} --baseUrl .`;
    console.log('Command:', tscCommand);
    
    execSync(tscCommand, {
        stdio: 'inherit',
        cwd: projectRoot
    });
    
        // Clean up the temporary tsconfig file
    if (fs.existsSync(tempTsConfigPath)) {
        fs.unlinkSync(tempTsConfigPath);
        console.log('Temporary tsconfig file removed');
    }
    
    console.log('TypeScript compilation completed successfully');
    
    // Build the preload script using our dedicated script
    console.log('\nBuilding preload script...');
    try {
        const preloadBuildScript = path.join(__dirname, 'build-preload-fixed.cjs');
        console.log(`Running: node ${preloadBuildScript}`);
        execSync(`node ${preloadBuildScript}`, {
            stdio: 'inherit',
            cwd: projectRoot
        });
        console.log('✅ Preload script built successfully');
    } catch (error) {
        console.error('❌ Failed to build preload script:', error);
        process.exit(1);
    }
    
    // Preload script is now handled by build-preload-fixed.cjs
    const preloadFinalPath = path.join(mainDistPath, 'preload.js');
    
    console.log('='.repeat(80));
    console.log('PRELOAD SCRIPT HANDLING');
    console.log('='.repeat(80));
    console.log(`- Using preload script built by build-preload-fixed.cjs`);
    console.log(`- Final path: ${preloadFinalPath}`);
    
    // Verify the preload script was built by build-preload-fixed.cjs
    if (!fs.existsSync(preloadFinalPath)) {
        console.error(`❌ ERROR: Preload script not found at ${preloadFinalPath}`);
        console.error('Please ensure build-preload-fixed.cjs runs successfully');
        process.exit(1);
    }
    
    const stats = fs.statSync(preloadFinalPath);
    console.log(`✅ Verified preload.js exists at ${preloadFinalPath} (${stats.size} bytes)`);
    console.log(`Contents of ${mainDistPath}:`, fs.readdirSync(mainDistPath));
    
    // Update the path in main.js to point to the correct location of preload.js
    const mainJsPath = path.join(distPath, 'main/src/main/main.js');
    if (fs.existsSync(mainJsPath)) {
        let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
        
        // Update the preload path in main.js
        console.log('Updating preload path in main.js...');
        
        // First, update the preloadPath constant
        const preloadPathRegex = /const preloadPath = path_1\.default\.join\(__dirname, ['\"]([^'\"]+)['\"]\)/;
        mainJsContent = mainJsContent.replace(
            preloadPathRegex,
            'const preloadPath = path_1.default.join(__dirname, \'preload.js\') // Updated by build script'
        );
        
        // Then update the BrowserWindow options
        const browserWindowRegex = /preload: path_1\.default\.join\(__dirname, ['\"]([^'\"]+)['\"]\)/;
        mainJsContent = mainJsContent.replace(
            browserWindowRegex,
            'preload: path_1.default.join(__dirname, \'preload.js\') // Updated by build script'
        );
        
        console.log('Preload path updated in main.js');
        
        // Write the updated content back to main.js
        fs.writeFileSync(mainJsPath, mainJsContent);
        console.log(`Updated preload path in ${mainJsPath}`);
    } else {
        console.error('Error: main.js not found at', mainJsPath);
        process.exit(1);
    }
    
    // List files in the output directory for debugging
    const outputDir = path.join(distPath, 'main');
    if (fs.existsSync(outputDir)) {
        console.log('Output files in dist/main:');
        const files = fs.readdirSync(outputDir);
        files.forEach(file => console.log(`- ${file}`));
    } else {
        console.error('Error: Output directory not found at', outputDir);
        process.exit(1);
    }
    
        // Compile preload.ts separately
    console.log('Compiling preload script...');
    try {
        // Ensure the output directory exists
        fs.mkdirSync(path.join(distPath, 'main'), { recursive: true });
        
        // Create the dist/main directory structure
        const outputDir = path.join(distPath, 'main');
        fs.mkdirSync(outputDir, { recursive: true });
        
        // Copy the preload script directly from src to dist
        const preloadSource = path.join(projectRoot, 'src/main/preload.ts');        
        const preloadDest = path.join(outputDir, 'preload.js');
        
        // Ensure the source file exists
        if (!fs.existsSync(preloadSource)) {
            console.error('Preload source file not found at:', preloadSource);
            process.exit(1);
        }
        
        // Read the source file
        let preloadContent = fs.readFileSync(preloadSource, 'utf8');
        
        // Update the import path to use a relative path
        preloadContent = preloadContent.replace(
            /from '..\/..\/shared\/ipc'/g, 
            "from './src/shared/ipc'"
        );
        
        // Write the updated content to the destination
        fs.writeFileSync(preloadDest, preloadContent);
        console.log('Preload script copied to:', preloadDest);
        
        // Also copy the shared directory
        const sharedSource = path.join(projectRoot, 'src/shared');
        const sharedDest = path.join(outputDir, 'src/shared');
        
        if (fs.existsSync(sharedSource)) {
            fs.mkdirSync(path.dirname(sharedDest), { recursive: true });
            fs.cpSync(sharedSource, sharedDest, { recursive: true });
            console.log('Shared files copied to:', sharedDest);
        } else {
            console.error('Shared source directory not found at:', sharedSource);
            process.exit(1);
        }
    } catch (error) {
        console.error('Error preparing preload script:', error);
        process.exit(1);
    }
    
    // Check if we need to rename index.js to main.js
    const indexPath = path.join(outputDir, 'index.js');
    const mainPath = path.join(outputDir, 'main.js');
    
    if (fs.existsSync(indexPath) && !fs.existsSync(mainPath)) {
        console.log(`Renaming ${path.basename(indexPath)} to ${path.basename(mainPath)}`);
        fs.renameSync(indexPath, mainPath);
        
        // Also rename the source map file if it exists
        const indexMapPath = indexPath + '.map';
        const mainMapPath = mainPath + '.map';
        
        if (fs.existsSync(indexMapPath)) {
            fs.renameSync(indexMapPath, mainMapPath);
        }
    }
    
    // Move files from dist/main/src/main to dist/main
    const srcMainOutputDir = path.join(distPath, 'main', 'src', 'main');
    const targetMainDir = path.join(distPath, 'main');
    
    if (fs.existsSync(srcMainOutputDir)) {
        console.log('Moving files to main output directory...');
        
        // Move all files from src/main to dist/main
        const files = fs.readdirSync(srcMainOutputDir);
        files.forEach(file => {
            const srcPath = path.join(srcMainOutputDir, file);
            const destPath = path.join(targetMainDir, file);
            
            // Ensure the destination directory exists
            fs.ensureDirSync(path.dirname(destPath));
            
            // Move the file
            fs.moveSync(srcPath, destPath, { overwrite: true });
            console.log(`Moved ${file} to ${destPath}`);
        });
        
        // Remove the now-empty src directory
        fs.removeSync(path.join(distPath, 'main', 'src'));
        console.log('Cleaned up temporary directories');
    }
    
    // Copy modules directory if it exists
    const srcModulesPath = path.join(projectRoot, 'src/modules');
    const distModulesPath = path.join(distPath, 'modules');
    
    if (fs.existsSync(srcModulesPath)) {
        console.log('Copying modules directory...');
        fs.ensureDirSync(distModulesPath);
        fs.copySync(srcModulesPath, distModulesPath, { overwrite: true });
        console.log('Modules directory copied successfully');
    } else {
        console.warn('Warning: src/modules directory not found at', srcModulesPath);
    }
    
    // Copy shared directory if it exists
    const srcSharedPath = path.join(projectRoot, 'src/shared');
    const distSharedPath = path.join(distPath, 'shared');
    
    if (fs.existsSync(srcSharedPath)) {
        console.log('Copying shared directory...');
        fs.ensureDirSync(distSharedPath);
        fs.copySync(srcSharedPath, distSharedPath, { overwrite: true });
        console.log('Shared directory copied successfully');
    } else {
        console.warn('Warning: src/shared directory not found at', srcSharedPath);
    }
    
    console.log('Build completed successfully!');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
