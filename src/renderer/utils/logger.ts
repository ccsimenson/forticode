export const logger = {
  info: (message: string, metadata?: any) => {
    console.log(`[INFO] ${message}`, metadata);
  },
  warn: (message: string, metadata?: any) => {
    console.warn(`[WARN] ${message}`, metadata);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error instanceof Error ? error : new Error(message));
  },
  debug: (message: string, metadata?: any) => {
    if (process.env['NODE_ENV'] === 'development') {
      console.debug(`[DEBUG] ${message}`, metadata);
    }
  }
};
