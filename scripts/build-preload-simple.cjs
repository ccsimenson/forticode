#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const projectRoot = path.join(__dirname, '..');
const distPath = path.join(projectRoot, 'dist');
const mainDistPath = path.join(distPath, 'main');

// Function to log messages with timestamp
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Function to log errors and exit
function errorAndExit(message, error = null) {
    log(`❌ ERROR: ${message}`);
    if (error) {
        console.error(error);
    }
    process.exit(1);
}

// Main function to handle the build process
async function buildPreloadScript() {
    try {
        // Ensure dist directory exists
        log('Ensuring dist directory exists...');
        if (!fs.existsSync(distPath)) {
            log(`Creating dist directory at ${distPath}`);
            fs.mkdirSync(distPath, { recursive: true });
            log(`Created dist directory at ${distPath}`);
        } else {
            log(`Dist directory already exists at ${distPath}`);
        }

        // Ensure main dist directory exists
        log('Ensuring main dist directory exists...');
        if (!fs.existsSync(mainDistPath)) {
            log(`Creating main dist directory at ${mainDistPath}`);
            fs.mkdirSync(mainDistPath, { recursive: true });
            log(`Created main dist directory at ${mainDistPath}`);
        } else {
            log(`Main dist directory already exists at ${mainDistPath}`);
        }

        // Paths for preload script
        const preloadSource = path.join(projectRoot, 'src/main/preload.ts');
        const preloadCompiledPath = path.join(mainDistPath, 'preload.js');
        const tempDir = path.join(distPath, 'temp-preload');

        // Log configuration
        log('='.repeat(80));
        log('PRELOAD SCRIPT BUILD CONFIGURATION');
        log('='.repeat(80));
        log(`- Project Root: ${projectRoot}`);
        log(`- Source: ${preloadSource}`);
        log(`- Destination: ${preloadCompiledPath}`);
        log(`- Temp Directory: ${tempDir}`);

        // Verify source file exists
        log('\nVerifying preload source file...');
        if (!fs.existsSync(preloadSource)) {
            errorAndExit(`Preload source file not found at ${preloadSource}`);
        }
        log(`✅ Preload source file found at ${preloadSource}`);

        // Create temporary directory for compilation
        log('\nSetting up temporary directory...');
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });
        log(`Created temporary directory at ${tempDir}`);

        // Create a minimal tsconfig for the preload script
        const tsConfig = {
            compilerOptions: {
                target: 'es2020',
                module: 'commonjs',
                moduleResolution: 'node',
                esModuleInterop: true,
                skipLibCheck: true,
                outDir: path.relative(projectRoot, path.dirname(preloadCompiledPath)),
                rootDir: path.relative(projectRoot, path.dirname(preloadSource)),
                baseUrl: projectRoot,
                paths: {
                    '@shared/*': ['src/shared/*']
                },
                sourceMap: true,
                declaration: false,
                strict: true
            },
            include: [path.relative(projectRoot, preloadSource)]
        };

        const tempTsConfigPath = path.join(tempDir, 'tsconfig.json');
        fs.writeFileSync(tempTsConfigPath, JSON.stringify(tsConfig, null, 2));
        log(`Created temporary tsconfig at ${tempTsConfigPath}`);

        // Compile the preload script
        log('\nCompiling preload script...');
        const tscCommand = `npx tsc -p ${tempTsConfigPath}`;
        log(`Running: ${tscCommand}`);
        
        try {
            // Execute TypeScript compiler
            execSync(tscCommand, { stdio: 'inherit' });
            
            // Verify the compiled file was created
            if (fs.existsSync(preloadCompiledPath)) {
                log(`✅ Successfully compiled preload.js to ${preloadCompiledPath}`);
                
                // Update import paths in the compiled file
                try {
                    log('\nUpdating import paths in preload.js...');
                    let content = fs.readFileSync(preloadCompiledPath, 'utf8');
                    
                    // Update @shared imports to use relative paths
                    const updatedContent = content.replace(
                        /require\(['"]@shared\/([^'"]+)['"]\)/g, 
                        'require(\'../../../shared/$1\\\\)'
                    );
                    
                    fs.writeFileSync(preloadCompiledPath, updatedContent);
                    log('✅ Successfully updated import paths');
                    
                    // Verify the file was written
                    const stats = fs.statSync(preloadCompiledPath);
                    log(`\n✅ Build completed successfully!`);
                    log(`   File: ${preloadCompiledPath}`);
                    log(`   Size: ${stats.size} bytes`);
                    
                    // Show directory contents for verification
                    log('\nContents of dist/main:');
                    console.log(fs.readdirSync(mainDistPath).map(f => `  - ${f}`).join('\n'));
                    
                } catch (error) {
                    errorAndExit('Error updating import paths', error);
                }
            } else {
                errorAndExit(`Failed to compile preload.js to ${preloadCompiledPath}`);
            }
        } catch (error) {
            errorAndExit('Error running TypeScript compiler', error);
        }
    } catch (error) {
        errorAndExit('Error in build process', error);
    } finally {
        // Clean up temporary directory if it exists
        if (tempDir && fs.existsSync(tempDir)) {
            log('\nCleaning up temporary files...');
            fs.rmSync(tempDir, { recursive: true, force: true });
            log('✅ Temporary files cleaned up');
        }
    }
}

// Run the build process
buildPreloadScript().catch(error => {
    console.error('Unhandled error in build process:', error);
    process.exit(1);
});
