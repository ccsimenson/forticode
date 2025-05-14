import { IpcChannels, CspValidationRequest, CspValidationResponse } from '@shared/ipc';

export class CspValidator {
  private static instance: CspValidator;
  
  private constructor() {}
  
  public static getInstance(): CspValidator {
    if (!CspValidator.instance) {
      CspValidator.instance = new CspValidator();
    }
    return CspValidator.instance;
  }

  /**
   * Validates a CSP string against security best practices
   */
  public validateCsp(csp: string, filePath?: string): CspValidationResponse {
    const result: CspValidationResponse = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check for common CSP misconfigurations
    this.checkForUnsafeDirectives(csp, result);
    this.checkForMissingDirectives(csp, result);
    this.checkForDeprecatedDirectives(csp, result);
    this.checkForInsecureSources(csp, result);
    
    // Additional checks can be added here
    
    // Update overall validation status
    result.isValid = result.errors.length === 0;
    
    return result;
  }

  /**
   * Generates a secure CSP based on the application's needs
   */
  public generateSecureCsp(options: {
    allowInlineScripts?: boolean;
    allowEval?: boolean;
    allowedDomains?: string[];
  } = {}): string {
    const directives: Record<string, string[]> = {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'"],
      'connect-src': ["'self'"],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"],
      'worker-src': ["'self'"],
      'manifest-src': ["'self'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"],
      'frame-ancestors': ["'none'"],
      'block-all-mixed-content': []
    };

    // Handle options
    if (options.allowInlineScripts) {
      directives['script-src'].push("'unsafe-inline'");
    }

    if (options.allowEval) {
      directives['script-src'].push("'unsafe-eval'");
    }

    if (options.allowedDomains && options.allowedDomains.length > 0) {
      const allowed = options.allowedDomains.filter(domain => 
        domain && domain.trim() !== '' && domain !== 'self'
      );
      
      if (allowed.length > 0) {
        directives['connect-src'].push(...allowed);
        directives['img-src'].push(...allowed);
      }
    }

    // Build the CSP string
    return Object.entries(directives)
      .filter(([_, values]) => values.length > 0)
      .map(([directive, sources]) => {
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');
  }

  /**
   * Checks for unsafe directives in the CSP
   */
  private checkForUnsafeDirectives(csp: string, result: CspValidationResponse) {
    const unsafeDirectives = [
      { directive: 'unsafe-inline', message: 'Allows inline scripts which can be a security risk' },
      { directive: 'unsafe-eval', message: 'Allows eval() which can be a security risk' },
      { directive: 'data:', message: 'Allows data: URIs which can be used for XSS attacks' },
      { directive: '*', message: 'Wildcard source can be dangerous if not properly scoped' }
    ];

    unsafeDirectives.forEach(item => {
      if (csp.includes(item.directive)) {
        result.warnings.push({
          directive: item.directive,
          warning: `Potentially unsafe directive: ${item.directive}`,
          suggestion: `Remove or properly scope the '${item.directive}' directive to minimize security risks.`
        });
      }
    });
  }

  /**
   * Checks for missing recommended directives
   */
  private checkForMissingDirectives(csp: string, result: CspValidationResponse) {
    const recommendedDirectives = [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'connect-src',
      'font-src',
      'object-src',
      'frame-ancestors',
      'form-action',
      'base-uri'
    ];

    const missingDirectives = recommendedDirectives.filter(directive => 
      !new RegExp(`\\b${directive}\\b`, 'i').test(csp)
    );

    if (missingDirectives.length > 0) {
      result.warnings.push({
        directive: 'CSP Headers',
        warning: `Missing recommended directives: ${missingDirectives.join(', ')}`,
        suggestion: 'Add these directives to your CSP for better security.'
      });
    }
  }

  /**
   * Checks for deprecated directives
   */
  private checkForDeprecatedDirectives(csp: string, result: CspValidationResponse) {
    const deprecatedDirectives = [
      { directive: 'referrer', replacement: 'Referrer-Policy header' },
      { directive: 'plugin-types', replacement: 'object-src and/or media-src' },
      { directive: 'report-uri', replacement: 'report-to' }
    ];

    deprecatedDirectives.forEach(item => {
      if (new RegExp(`\\b${item.directive}\\b`, 'i').test(csp)) {
        result.warnings.push({
          directive: item.directive,
          warning: `Deprecated directive: ${item.directive}`,
          suggestion: `Replace '${item.directive}' with '${item.replacement}'.`
        });
      }
    });
  }

  /**
   * Checks for insecure sources in the CSP
   */
  private checkForInsecureSources(csp: string, result: CspValidationResponse) {
    const insecurePatterns = [
      { pattern: 'http://', message: 'Insecure HTTP protocol' },
      { pattern: '*.example.com', message: 'Wildcard subdomains can be insecure' },
      { pattern: 'unsafe-inline', message: 'Allows inline scripts' },
      { pattern: 'unsafe-eval', message: 'Allows eval()' },
      { pattern: 'data:', message: 'Allows data URIs' },
      { pattern: 'blob:', message: 'Allows blob URIs' },
      { pattern: 'filesystem:', message: 'Allows filesystem URIs' }
    ];

    insecurePatterns.forEach(item => {
      if (csp.includes(item.pattern)) {
        result.warnings.push({
          directive: 'Source Whitelist',
          warning: `Insecure source pattern: ${item.pattern}`,
          suggestion: `Review and restrict the use of '${item.pattern}' in your CSP.`
        });
      }
    });
  }

  /**
   * Registers IPC handlers for CSP-related operations
   */
  public registerIpcHandlers(ipcMain: Electron.IpcMain) {
    // Handle CSP validation requests
    ipcMain.handle(IpcChannels.CSP_VALIDATE, async (_, request: CspValidationRequest) => {
      return this.validateCsp(request.csp, request.filePath);
    });

    // Handle CSP generation requests
    ipcMain.handle(IpcChannels.CSP_GENERATE, async (_, options: any) => {
      return this.generateSecureCsp(options);
    });
  }
}
