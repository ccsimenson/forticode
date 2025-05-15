#!/usr/bin/env node

const { writeFile } = require('fs/promises');
const { join } = require('path');
const { execSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');

// Ensure output directory exists
const distPath = join(__dirname, '../dist/main');
if (!existsSync(distPath)) {
    mkdirSync(distPath, { recursive: true });
}

// Build main process TypeScript
execSync('tsc -p tsconfig.main.json', { stdio: 'inherit' });

// Create package.json for main process
const packageJson = {
    name: 'forticode-main',
    version: '1.0.0',
    main: 'index.js',
    type: 'commonjs',
    dependencies: {
        'electron': require('../package.json').dependencies.electron
    }
};

writeFile(join(__dirname, '../dist/main/package.json'), JSON.stringify(packageJson, null, 2))
    .catch(err => console.error('Error creating main process package.json:', err));
