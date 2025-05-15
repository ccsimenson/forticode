import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import { registerSecurityHandlers } from './security/security-handler.js';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload.js'),
            sandbox: true,
            webviewTag: false
        },
        show: false,
        backgroundColor: '#121212',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#121212',
            symbolColor: '#F1F1F1'
        }
    });

    // Ensure preload script is built
    const { execSync } = require('child_process');
    try {
        execSync('npm run build:preload', { stdio: 'inherit' });
    } catch (error) {
        console.error('Failed to build preload script:', error);
    }

    // Set up security policies
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com;"
                ].join('')
            }
        });
    });

    if (process.env['NODE_ENV'] === 'development') {
        // Get the actual Vite port from the environment
        const port = parseInt(process.env['VITE_PORT'] || '5173');
        mainWindow.loadURL(`http://localhost:${port}`)
            .then(() => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.webContents.openDevTools();
                }
            })
            .catch((error) => {
                console.error('Failed to load development URL:', error);
            });
    } else {
        const rendererPath = path.join(__dirname, '../renderer');
        mainWindow.loadFile(path.join(rendererPath, 'index.html'))
            .then(() => {
                if (mainWindow) {
                    mainWindow.show();
                }
            })
            .catch((error) => {
                console.error('Failed to load file:', error);
            });
    }

    if (mainWindow) {
        mainWindow.on('closed', () => {
            mainWindow = null;
        });

        mainWindow.on('ready-to-show', () => {
            if (mainWindow) {
                mainWindow.show();
            }
        });
    }
}

app.on('ready', () => {
    createWindow();
    registerSecurityHandlers();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
