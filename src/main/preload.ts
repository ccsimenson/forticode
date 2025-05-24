// @ts-check
import { contextBridge, ipcRenderer } from 'electron';
// Using the @shared alias defined in tsconfig
import { IpcChannels } from '@shared/ipc';

// Extend the global Window interface
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, ...args: any[]): void;
        on(channel: string, listener: (...args: any[]) => void): () => void;
        once(channel: string, listener: (...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
        invoke(channel: string, ...args: any[]): Promise<any>;
      };
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
    };
  }
}

// Whitelist of valid channels
const validChannels: string[] = Object.values(IpcChannels);

// Helper function to validate IPC channels
function isValidChannel(channel: string): boolean {
  return validChannels.includes(channel);
}

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      if (isValidChannel(channel)) {
        ipcRenderer.send(channel, ...args);
      } else {
        console.warn(`Attempted to send to unregistered channel: ${channel}`);
      }
    },
    
    on: (channel: string, listener: (...args: any[]) => void): () => void => {
      if (isValidChannel(channel)) {
        const subscription = (_event: any, ...args: any[]) => listener(...args);
        ipcRenderer.on(channel, subscription);
        
        // Return cleanup function
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      }
      
      console.warn(`Attempted to listen to unregistered channel: ${channel}`);
      return () => {}; // Return empty cleanup function
    },
    
    once: (channel: string, listener: (...args: any[]) => void): void => {
      if (isValidChannel(channel)) {
        ipcRenderer.once(channel, (_event: any, ...args: any[]) => {
          listener(...args);
        });
      } else {
        console.warn(`Attempted to listen once to unregistered channel: ${channel}`);
      }
    },
    
    removeAllListeners: (channel: string) => {
      if (isValidChannel(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
    
    invoke: async (channel: string, ...args: any[]): Promise<any> => {
      if (isValidChannel(channel)) {
        return await ipcRenderer.invoke(channel, ...args);
      }
      return null;
    }
  },
  
  // Add any other methods you want to expose to the renderer process
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Log that preload script has been loaded
console.log('Preload script loaded');
