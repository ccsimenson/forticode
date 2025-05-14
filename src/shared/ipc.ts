// Define all IPC channel names in one place for type safety
export enum IpcChannels {
  // Window controls
  WINDOW_MINIMIZE = 'window:minimize',
  WINDOW_MAXIMIZE = 'window:maximize',
  WINDOW_CLOSE = 'window:close',
  WINDOW_IS_MAXIMIZED = 'window:is-maximized',
  
  // File operations
  FILE_OPEN = 'file:open',
  FILE_SAVE = 'file:save',
  
  // CSP operations
  CSP_VALIDATE = 'csp:validate',
  CSP_GENERATE = 'csp:generate',
  CSP_APPLY = 'csp:apply',
  
  // Security scans
  SECURITY_SCAN = 'security:scan',
  SECURITY_FIX = 'security:fix',
  
  // GitHub integration
  GITHUB_AUTHENTICATE = 'github:authenticate',
  GITHUB_SCAN_REPO = 'github:scan-repo',
  GITHUB_GET_REPOS = 'github:get-repos',
  
  // Settings
  SETTINGS_GET = 'settings:get',
  SETTINGS_UPDATE = 'settings:update',
  
  // Updates
  CHECK_FOR_UPDATES = 'updates:check',
  DOWNLOAD_UPDATE = 'updates:download',
  INSTALL_UPDATE = 'updates:install'
}

// Define the shape of the data for each channel
export interface IpcRequest<T = any> {
  id: string;
  method: string;
  params?: T;
}

export interface IpcResponse<T = any> {
  id: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// Define specific request/response types for each channel
export type CspValidationRequest = {
  csp: string;
  filePath?: string;
};

export type CspValidationResponse = {
  isValid: boolean;
  errors: Array<{
    directive: string;
    error: string;
    line?: number;
    column?: number;
  }>;
  warnings: Array<{
    directive: string;
    warning: string;
    suggestion: string;
  }>;
};

export type SecurityScanRequest = {
  directory: string;
  options?: {
    recursive?: boolean;
    checkDependencies?: boolean;
    checkCsp?: boolean;
  };
};

export type SecurityScanResponse = {
  summary: {
    totalFiles: number;
    issuesFound: number;
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
    scanTime: number;
  };
  issues: Array<{
    file: string;
    line?: number;
    column?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    fix?: string;
    codeSnippet?: string;
  }>;
};
