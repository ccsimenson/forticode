import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcChannels } from '@shared/ipc.js';

// Define a custom interface for our exposed API
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
const validChannels = Object.values(IpcChannels);

// Helper function to validate IPC channels
function isValidChannel(channel: string): boolean {
  return validChannels.includes(channel as any);
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]): void => {
      if (isValidChannel(channel)) {
        ipcRenderer.send(channel, ...args);
      } else {
        console.warn(`Attempted to send to unregistered channel: ${channel}`);
      }
    },
    
    on: (channel: string, listener: (...args: any[]) => void): (() => void) => {
      if (isValidChannel(channel)) {
        // Strip event as it includes `sender`
        const subscription = (_event: IpcRendererEvent, ...args: any[]) => listener(...args);
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
        // Strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => listener(...args));
      } else {
        console.warn(`Attempted to listen once to unregistered channel: ${channel}`);
      }
    },
    
    removeAllListeners: (channel: string): void => {
      if (isValidChannel(channel)) {
        ipcRenderer.removeAllListeners(channel);
      } else {
        console.warn(`Attempted to remove listeners from unregistered channel: ${channel}`);
      }
    },
    
    invoke: async (channel: string, ...args: any[]): Promise<any> => {
      if (isValidChannel(channel)) {
        try {
          return await ipcRenderer.invoke(channel, ...args);
        } catch (error) {
          console.error(`Error invoking ${channel}:`, error);
          throw error;
        }
      }
      
      console.warn(`Attempted to invoke unregistered channel: ${channel}`);
      return Promise.reject(new Error(`Invalid channel: ${channel}`));
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
