// Vitest setup
import { vi, afterAll } from 'vitest';

// Extend the Window interface to include our electron property
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, listener: (...args: any[]) => void) => () => void;
        once: (channel: string, listener: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
    };
  }
}

// Mock window.electron
const mockIpcRenderer = {
  send: vi.fn(),
  on: vi.fn().mockImplementation((_channel: string, _listener: (...args: any[]) => void) => {
    // Return a cleanup function
    return () => vi.fn();
  }),
  once: vi.fn(),
  removeAllListeners: vi.fn(),
  invoke: vi.fn().mockResolvedValue(undefined),
};

window.electron = {
  ipcRenderer: mockIpcRenderer,
  versions: {
    node: '16.0.0',
    chrome: '100.0.0',
    electron: '22.0.0',
  },
};

// Mock window.require for Electron modules
const mockRequire = vi.fn().mockImplementation((module: string) => {
  if (module === 'electron') {
    return {
      ipcRenderer: mockIpcRenderer,
      remote: {},
      shell: {},
      app: {},
    };
  }
  return {};
});

// Add the missing properties to match the NodeJS.Require type
Object.assign(mockRequire, {
  cache: {},
  extensions: {},
  main: undefined,
  resolve: vi.fn(),
});

// @ts-ignore - We're intentionally mocking require
Object.defineProperty(window, 'require', {
  value: mockRequire,
  writable: true,
  configurable: true,
});

// Mock global console methods
const originalConsole = { ...console };
Object.assign(console, {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
});

// @ts-ignore - We're intentionally mocking console
global.console = console;

// Restore original console in afterAll
afterAll(() => {
  // @ts-ignore - Restoring original console
  global.console = originalConsole;
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// @ts-ignore - We're intentionally mocking ResizeObserver
window.ResizeObserver = MockResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock requestAnimationFrame
const originalRequestAnimationFrame = global.requestAnimationFrame;
const originalCancelAnimationFrame = global.cancelAnimationFrame;

global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return window.setTimeout(() => callback(performance.now()), 0);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Restore original animation frame functions in afterAll
afterAll(() => {
  global.requestAnimationFrame = originalRequestAnimationFrame;
  global.cancelAnimationFrame = originalCancelAnimationFrame;
});
