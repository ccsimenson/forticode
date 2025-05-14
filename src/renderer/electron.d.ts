// Type definitions for the Electron API exposed to the renderer process

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        /** Send a message to the main process via the specified channel */
        send(channel: string, ...args: any[]): void;
        
        /** Listen for messages on the specified channel */
        on(channel: string, listener: (...args: any[]) => void): () => void;
        
        /** Listen for a single message on the specified channel */
        once(channel: string, listener: (...args: any[]) => void): void;
        
        /** Remove all listeners for the specified channel */
        removeAllListeners(channel: string): void;
        
        /** Invoke an IPC handler in the main process */
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

export {}; // This ensures the file is treated as a module
