console.log('Checking for Squirrel events...');
console.log('Process args:', process.argv);

// Check if we're being run by Squirrel
const isSquirrel = process.argv.some(arg => 
  arg.includes('squirrel') || 
  arg.includes('Squirrel')
);

console.log('Is Squirrel event?', isSquirrel);

// If this is a Squirrel event, exit immediately
if (isSquirrel) {
  console.log('Detected Squirrel event, exiting...');
  process.exit(0);
}

console.log('No Squirrel events detected, continuing...');

// Try to load Electron
console.log('Attempting to load Electron...');
try {
  const { app } = require('electron');
  console.log('Electron app module loaded successfully');
  
  app.whenReady().then(() => {
    console.log('Electron app is ready');
    app.quit();
  });
} catch (error) {
  console.error('Failed to load Electron:', error);
  process.exit(1);
}
