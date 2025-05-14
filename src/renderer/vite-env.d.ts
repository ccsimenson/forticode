/// <reference types="vite/client" />

// Import Electron renderer process types
/// <reference types="electron" />

// Define types for environment variables
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend the Window interface to include our custom properties
declare interface Window {
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
