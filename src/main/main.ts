import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import path from 'path';
const CspValidator = require('../../dist/modules/csp/CspValidator').default;
import { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
const install = require('electron-devtools-installer');

// In CommonJS, __filename and __dirname are available by default
// No need to define them manually

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Check if we're in development mode
const isDevelopment = process.env['NODE_ENV'] === 'development' || process.env['ELECTRON_IS_DEV'] === '1';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Initialize CSP Validator
const cspValidator = CspValidator.getInstance();

// Register IPC handlers
function registerIpcHandlers() {
  cspValidator.registerIpcHandlers(ipcMain);
  
  // Add any additional IPC handlers here
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });
}

// __filename and __dirname are already available in CommonJS

// Environment variables from Vite
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
const createWindow = async () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      webgl: false,
      plugins: false
    },
    title: 'Electron Security Auditor',
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  // Load the app
  if (isDevelopment) {
    // In development, load from the Vite dev server with HMR
    await mainWindow.loadURL('http://localhost:3000');
    
    // Open dev tools in development
    mainWindow.webContents.openDevTools();
    
    // Install React and Redux devtools in development
    try {
      await Promise.all([
        install.default(REACT_DEVELOPER_TOOLS),
        install.default(REDUX_DEVTOOLS)
      ]);
    } catch (error) {
      console.error('Failed to install devtools:', error);
    }
  } else if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // In development with Vite (fallback)
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    // In production, load the built files
    await mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  // Set up CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self' https:"
    ].join('; ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': csp
      }
    });
  });

  // Register IPC handlers
  registerIpcHandlers();
  
  // Create the main window
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
