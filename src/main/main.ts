import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import * as fs from 'fs';
import path from 'path';
import 'module-alias/register';

// Configure module aliases
require('module-alias').addAliases({
  '@modules': path.join(__dirname, '..', 'modules')
});

const CspValidator = require('@modules/csp/CspValidator').default;

// We'll import these dynamically when needed to avoid initialization issues
let install: any;
let REACT_DEVELOPER_TOOLS: any;
let REDUX_DEVTOOLS: any;

// In CommonJS, __filename and __dirname are available by default
// No need to define them manually

// Handle Squirrel events for Windows
const handleSquirrelEvent = () => {
  if (process.platform !== 'win32') {
    return false;
  }

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);
  const spawn = require('child_process').spawn;

  const spawnUpdate = (args: string[]) => {
    try {
      spawn(updateDotExe, args, { detached: true }).on('close', () => process.exit());
      return true;
    } catch (error) {
      console.error('Failed to spawn Squirrel process:', error);
      return false;
    }
  };

  const squirrelEvent = process.argv[1];
  console.log('Processing Squirrel event:', squirrelEvent);

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Create desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);
      return true;

    case '--squirrel-uninstall':
      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);
      return true;

    case '--squirrel-obsolete':
      // This is called when the app is being uninstalled
      app.quit();
      return true;
  }

  return false;
};

// Handle Squirrel events - exit immediately if this is a Squirrel event
if (handleSquirrelEvent()) {
  console.log('Handled Squirrel event, exiting...');
  setTimeout(app.quit, 100);
  process.exit(0);
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

// Check if we're in development mode
const isDevelopment = process.env['NODE_ENV'] === 'development' || process.env['ELECTRON_IS_DEV'] === '1';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Add the missing property to the app object
declare global {
  namespace NodeJS {
    interface Global {
      __mainWindow: BrowserWindow | null;
    }
  }
}

// Store the main window reference globally
app.on('ready', () => {
  (global as any).__mainWindow = mainWindow;
});

// Initialize CSP Validator
console.log('Initializing CSP Validator...');
let cspValidator: any; // Type should be imported from the module if available
try {
  cspValidator = CspValidator.getInstance();
  console.log('CSP Validator initialized successfully');
} catch (error) {
  console.error('Failed to initialize CSP Validator:', error);
  process.exit(1);
}

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
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return;
  }
  // Get the correct path for the preload script
  const isDev = process.env['NODE_ENV'] === 'development';
  const preloadPath = isDev
    ? path.join(__dirname, 'preload.js') // In development, it's in the src/main directory
    : path.join(process.resourcesPath, 'app/dist/main/preload.js'); // In production, it's in the dist/main directory
  
  console.log('Preload script path:', preloadPath);
  
  // Verify the preload file exists
  if (!fs.existsSync(preloadPath)) {
    console.error('Preload script not found at:', preloadPath);
    console.error('Current working directory:', process.cwd());
    console.error('__dirname:', __dirname);
    console.error('Files in directory:', fs.readdirSync(path.dirname(preloadPath)));
    process.exit(1);
  }

  // Create the browser window with better defaults
  mainWindow = new BrowserWindow({
    show: false, // Don't show until ready-to-show
    width: 1200,
    height: 800,
    backgroundColor: '#1a1b1e', // Match dark theme background
    titleBarStyle: 'hidden', // Hide default title bar
    frame: false, // Use custom frame
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
      webgl: false, // Disable WebGL if not needed
      disableBlinkFeatures: 'Auxclick',
      backgroundThrottling: false, // Keep animations smooth when tab is not focused
      disableHtmlFullscreenWindowResize: true,
      enableWebSQL: false, // Disable WebSQL if not needed
      allowRunningInsecureContent: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      scrollBounce: false,
      webviewTag: false, // Disable webview tag for security
      additionalArguments: [
        '--disable-http-cache',
        '--disable-http2',
        '--disable-software-rasterizer',
        '--disable-gpu',
        '--no-sandbox'
      ]
    },
    titleBarOverlay: {
      color: '#1a1b1e',
      symbolColor: '#ffffff',
      height: 30
    }
  });

  // Load the app
  if (isDevelopment) {
    try {
      // In development, load from the Vite dev server with HMR
      const viteDevServer = 'http://localhost:3001';
      console.log(`Connecting to Vite dev server at ${viteDevServer}`);
      
      // Wait for the Vite dev server to be ready with retry logic
      const maxRetries = 10;
      let retries = 0;
      let connected = false;
      
      while (retries < maxRetries && !connected) {
        try {
          console.log(`Attempting to connect to Vite dev server (attempt ${retries + 1}/${maxRetries})...`);
          await mainWindow.loadURL(viteDevServer);
          connected = true;
          console.log('Successfully connected to Vite dev server');
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            console.error('Failed to connect to Vite dev server after multiple attempts:', error);
            throw error;
          }
          // Wait 1 second between retries
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Open dev tools in development
      mainWindow.webContents.openDevTools({ mode: 'detach' });
      
      // Dynamically import devtools installer when needed
      if (!install) {
        const devtoolsInstaller = await import('electron-devtools-installer');
        install = devtoolsInstaller.default;
        REACT_DEVELOPER_TOOLS = devtoolsInstaller.REACT_DEVELOPER_TOOLS;
        REDUX_DEVTOOLS = devtoolsInstaller.REDUX_DEVTOOLS;
        
        console.log('Installing developer tools...');
        // Install React and Redux devtools in development
        try {
          await Promise.all([
            install(REACT_DEVELOPER_TOOLS),
            install(REDUX_DEVTOOLS)
          ]);
          console.log('Developer tools installed successfully');
        } catch (error) {
          console.error('Failed to install devtools:', error);
        }
      }
      
      console.log('Development server started successfully');
    } catch (error) {
      console.error('Failed to start development server:', error);
      if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, '../../public/error.html'));
      }
    }
  } else if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // In development with Vite (fallback)
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    // In production, load the built files
    await mainWindow.loadFile(
      path.join(__dirname, '../../dist/renderer/index.html')
    );
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      if (isDevelopment) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
      }
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Handle window being closed by the user
  mainWindow.on('close', (e) => {
    // Check if the app is actually quitting or just hiding the window
    const isQuitting = (app as any).quitting || false;
    
    if (isQuitting) {
      mainWindow = null;
      if (process.platform !== 'darwin') {
        app.quit();
      }
    } else {
      e.preventDefault();
      if (mainWindow) {
        mainWindow.hide();
      }
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
async function initializeApp() {
  try {
    console.log('Initializing application...');
    
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
    console.log('Registering IPC handlers...');
    registerIpcHandlers();
    
    // Create the main window
    console.log('Creating main window...');
    await createWindow();
    
    console.log('Application initialization complete');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create window on macOS when the dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch(error => {
      console.error('Failed to create window:', error);
      app.quit();
    });
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize the app when Electron is ready
app.whenReady().then(() => {
  initializeApp().catch(error => {
    console.error('Failed to initialize app:', error);
    app.quit();
  });
}).catch(error => {
  console.error('Failed to start application:', error);
  app.quit();
});
