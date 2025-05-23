const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const distPath = path.join(projectRoot, 'dist');
const mainDistPath = path.join(distPath, 'main');

console.log('Starting minimal build...');

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });
fs.mkdirSync(mainDistPath, { recursive: true });

// Create a minimal tsconfig for the main process
const minimalTsConfig = {
    "compilerOptions": {
        "target": "ES2020",
        "module": "CommonJS",
        "outDir": "./dist/main",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "sourceMap": true,
        "types": ["node", "electron"],
        "baseUrl": "./src",
        "paths": {
            "@/*": ["./*"],
            "@main/*": ["main/*"],
            "@renderer/*": ["renderer/*"],
            "@shared/*": ["shared/*"],
            "@modules/*": ["modules/*"]
        }
    },
    "include": ["src/main/**/*.ts"]
};

const tsConfigPath = path.join(projectRoot, 'tsconfig.minimal.json');
fs.writeFileSync(tsConfigPath, JSON.stringify(minimalTsConfig, null, 2));

console.log('Compiling minimal TypeScript...');
try {
    execSync(`npx tsc -p ${tsConfigPath} --pretty`, {
        stdio: 'inherit',
        cwd: projectRoot
    });
    
    console.log('Minimal build completed successfully!');
    
    // List the output files
    const listFiles = (dir, prefix = '') => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
            console.log(`${prefix}${file.name}${file.isDirectory() ? '/' : ''}`);
            if (file.isDirectory()) {
                listFiles(path.join(dir, file.name), `${prefix}  `);
            }
        });
    };
    
    console.log('\nOutput files:');
    listFiles(distPath);
    
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
} finally {
    // Clean up temporary config
    if (fs.existsSync(tsConfigPath)) {
        fs.unlinkSync(tsConfigPath);
    }
}
