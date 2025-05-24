console.log('Starting simple test...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Try to require Electron
console.log('Attempting to require electron...');
try {
  const electron = require('electron');
  console.log('Electron version:', electron.app.getVersion());
  
  electron.app.whenReady().then(() => {
    console.log('Electron app is ready!');
    
    const { BrowserWindow } = electron;
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    win.loadURL('https://www.electronjs.org');
    console.log('BrowserWindow created and URL loaded');
  });
  
  electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      electron.app.quit();
    }
  });
  
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
