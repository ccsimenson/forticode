// Type definitions for module aliases
declare module '@shared/*' {
  const value: any;
  export = value;
  export default value;
}

declare module '@renderer/*' {
  const value: any;
  export = value;
  export default value;
}

declare module '@main/*' {
  const value: any;
  export = value;
  export default value;
}

declare module '@modules/*' {
  const value: any;
  export = value;
  export default value;
}

// Global type declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    GITHUB_TOKEN?: string;
    // Add other environment variables as needed
  }
}

// Add any other global type declarations as needed
