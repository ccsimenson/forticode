import '@testing-library/jest-dom';

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
  send: jest.fn(),
  on: jest.fn().mockImplementation((_channel: string, _listener: (...args: any[]) => void) => {
    // Return a cleanup function
    return () => jest.fn();
  }),
  once: jest.fn(),
  removeAllListeners: jest.fn(),
  invoke: jest.fn().mockResolvedValue(undefined),
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
const mockRequire = jest.fn().mockImplementation((module: string) => {
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
  resolve: jest.fn(),
});

// @ts-ignore - We're intentionally mocking require
window.require = mockRequire as unknown as NodeJS.Require;

// Mock global console methods
const originalConsole = { ...console };
const mockConsole = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// @ts-ignore - We're intentionally mocking console
global.console = mockConsole;

// Restore original console in afterAll
afterAll(() => {
  // @ts-ignore - Restoring original console
  global.console = originalConsole;
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

// @ts-ignore - We're intentionally mocking ResizeObserver
window.ResizeObserver = MockResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
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
