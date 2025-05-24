const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting test build...');

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync('dist', { recursive: true });

// Run TypeScript compiler with verbose output
console.log('Running TypeScript compiler...');
try {
  execSync('npx tsc -p tsconfig.main.json --listFiles --pretty', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('TypeScript compilation completed successfully');
} catch (error) {
  console.error('TypeScript compilation failed:', error);
  process.exit(1);
}

// List all files in dist directory
console.log('\nContents of dist directory:');
const listFiles = (dir, indent = '') => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    console.log(`${indent}${file}${stat.isDirectory() ? '/' : ''}`);
    if (stat.isDirectory()) {
      listFiles(fullPath, indent + '  ');
    }
  });
};

if (fs.existsSync('dist')) {
  listFiles('dist');
} else {
  console.log('dist directory does not exist');
}
