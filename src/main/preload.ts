import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from '@shared/ipc';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      // Whitelist channels
      const validChannels = Object.values(IpcChannels);
      if (validChannels.includes(channel as IpcChannels)) {
        ipcRenderer.send(channel, ...args);
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = Object.values(IpcChannels);
      if (validChannels.includes(channel as IpcChannels)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
    invoke: (channel: string, ...args: any[]) => {
      const validChannels = Object.values(IpcChannels);
      if (validChannels.includes(channel as IpcChannels)) {
        return ipcRenderer.invoke(channel, ...args);
      }
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
