import { ValidationSeverity } from '../../shared/ipc.js';

// CSP Level types
type CspLevel = '1' | '2' | '3';

// CSP Directives - used for type checking
type CspDirective = 
  | 'default-src' | 'script-src' | 'style-src' | 'img-src' | 'connect-src'
  | 'font-src' | 'object-src' | 'media-src' | 'frame-src' | 'child-src'
  | 'frame-ancestors' | 'form-action' | 'base-uri' | 'sandbox' | 'report-uri'
  | 'report-to' | 'worker-src' | 'manifest-src' | 'prefetch-src' | 'navigate-to'
  | 'script-src-attr' | 'script-src-elem' | 'style-src-attr' | 'style-src-elem';

// CSP Source Expressions - used for type checking
type CspSourceExpression = 
  | "'none'" | "'self'" | "'unsafe-inline'" | "'unsafe-eval'" | "'strict-dynamic'"
  | "'unsafe-hashes'" | "'report-sample'" | "'wasm-unsafe-eval'"
  | `'nonce-${string}'`
  | `'sha256-${string}'` | `'sha384-${string}'` | `'sha512-${string}'`
  | 'http:' | 'https:' | 'data:' | 'blob:' | 'filesystem:' | 'mediastream:'
  | `http://${string}` | `https://${string}`
  | 'self' | 'unsafe-inline' | 'unsafe-eval' | string;

// Export types to avoid unused warnings
export type { CspDirective, CspSourceExpression };

// Error codes as constants
const ERROR_CODES = {
  INVALID_CSP_STRING: 'INVALID_CSP_STRING',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DIRECTIVE: 'INVALID_DIRECTIVE',
  INVALID_SOURCE_EXPRESSION: 'INVALID_SOURCE_EXPRESSION',
  MISSING_REQUIRED_DIRECTIVE: 'MISSING_REQUIRED_DIRECTIVE',
  DEPRECATED_DIRECTIVE: 'DEPRECATED_DIRECTIVE',
  UNNECESSARY_DIRECTIVE: 'UNNECESSARY_DIRECTIVE',
  INSECURE_SOURCE: 'INSECURE_SOURCE',
  MISSING_REPORTING: 'MISSING_REPORTING',
  MIXED_CONTENT: 'MIXED_CONTENT',
  INVALID_NONCE: 'INVALID_NONCE',
  INVALID_HASH: 'INVALID_HASH',
  DEPRECATED_SOURCE: 'DEPRECATED_SOURCE',
  BROWSER_COMPATIBILITY: 'BROWSER_COMPATIBILITY',
  INVALID_REPORTING_ENDPOINT: 'INVALID_REPORTING_ENDPOINT',
  INVALID_SANDBOX: 'INVALID_SANDBOX',
  INVALID_TRUSTED_TYPES: 'INVALID_TRUSTED_TYPES',
  INSECURE_SCRIPT_SRC: 'INSECURE_SCRIPT_SRC',
  INSECURE_STYLE_SRC: 'INSECURE_STYLE_SRC',
  INSECURE_IMG_SRC: 'INSECURE_IMG_SRC',
  INSECURE_FONT_SRC: 'INSECURE_FONT_SRC',
  INSECURE_CONNECT_SRC: 'INSECURE_CONNECT_SRC',
  INSECURE_MEDIA_SRC: 'INSECURE_MEDIA_SRC',
  INSECURE_OBJECT_SRC: 'INSECURE_OBJECT_SRC',
  INSECURE_FRAME_SRC: 'INSECURE_FRAME_SRC',
  INSECURE_CHILD_SRC: 'INSECURE_CHILD_SRC'
} as const;

type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Warning codes as constants
const WARNING_CODES = {
  MISSING_DEFAULT_SRC: 'MISSING_DEFAULT_SRC',
  UNSAFE_INLINE: 'UNSAFE_INLINE',
  UNSAFE_EVAL: 'UNSAFE_EVAL',
  WILDCARD_SOURCE: 'WILDCARD_SOURCE',
  HTTP_SOURCE: 'HTTP_SOURCE',
  DEPRECATED_DIRECTIVE: 'DEPRECATED_DIRECTIVE',
  UNSAFE_INLINE_WITHOUT_STRICT_DYNAMIC: 'UNSAFE_INLINE_WITHOUT_STRICT_DYNAMIC',
  UNSAFE_EVAL_DETECTED: 'UNSAFE_EVAL_DETECTED',
  MISSING_REQUIRED_DIRECTIVE: 'MISSING_REQUIRED_DIRECTIVE',
  MISSING_OBJECT_SRC: 'MISSING_OBJECT_SRC',
  MISSING_BASE_URI: 'MISSING_BASE_URI',
  MISSING_FORM_ACTION: 'MISSING_FORM_ACTION',
  MISSING_FRAME_ANCESTORS: 'MISSING_FRAME_ANCESTORS',
  MISSING_REPORT_TO: 'MISSING_REPORT_TO',
  MISSING_REPORT_URI: 'MISSING_REPORT_URI',
  MIXED_CONTENT: 'MIXED_CONTENT',
  DEPRECATED_REPORT_URI: 'DEPRECATED_REPORT_URI',
  DEPRECATED_SOURCE: 'DEPRECATED_SOURCE',
  LEGACY_DIRECTIVE: 'LEGACY_DIRECTIVE',
  MISSING_TRUSTED_TYPES: 'MISSING_TRUSTED_TYPES'
} as const;

type WarningCode = typeof WARNING_CODES[keyof typeof WARNING_CODES];

// CSP Validation Metadata
interface CspValidationMeta {
  cspLevel: CspLevel;
  usesStrictDynamic: boolean;
  usesNoncesOrHashes: boolean;
  allowsUnsafeInline: string[];
  allowsUnsafeEval: string[];
}

interface CspValidationResult {
  isValid: boolean;
  errors: CspValidationError[];
  warnings: CspValidationWarning[];
  recommendations: string[];
  parsedDirectives: Record<string, string[]>;
  meta: CspValidationMeta;
}

interface CspValidationOptions {
  filePath?: string;
  strict?: boolean;
}

interface CspValidationError {
  directive: string;
  message: string;
  severity: ValidationSeverity.ERROR;
  errorCode: ErrorCode;
  suggestion?: string;
  line?: number;
  column?: number;
  context?: Record<string, unknown>;
}

interface CspValidationWarning {
  directive: string;
  message: string;
  severity: ValidationSeverity.WARNING;
  warningCode: WarningCode;
  suggestion?: string;
  line?: number;
  column?: number;
  context?: Record<string, unknown>;
}

interface CspValidationResponse extends CspValidationResult {
  // Add any additional response properties here
}

// Caches for parsed CSP and validation results
const parsedCspCache = new Map<string, Record<string, string[]>>();
const validationResultCache = new Map<string, CspValidationResponse>();

// Lazy-loaded validation rules
interface ValidationRule {
  name: string;
  validate: (directives: Record<string, string[]>, result: CspValidationResult) => void;
}

// Cache for loaded validation rules
let validationRules: ValidationRule[] | null = null;

export class CspValidator {
  /**
   * Registers IPC handlers for CSP validation
   * @param ipcMain The Electron ipcMain module
   */
  public registerIpcHandlers(_ipcMain: typeof import('electron').ipcMain): void {
    // TODO: Implement IPC handlers for CSP validation
  }

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
  public validateCsp(csp: string, options: CspValidationOptions = {}): CspValidationResponse {
    // Check cache first if not in strict mode
    if (!options.strict) {
      const cacheKey = csp.trim();
      const cachedResult = validationResultCache.get(cacheKey);
      if (cachedResult) {
        return { ...cachedResult };
      }
    }

    const result: CspValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: [],
      parsedDirectives: {},
      meta: {
        cspLevel: '3',
        usesStrictDynamic: false,
        usesNoncesOrHashes: false,
        allowsUnsafeInline: [],
        allowsUnsafeEval: []
      }
    };

    try {
      if (!csp || typeof csp !== 'string') {
        this.addError(result, {
          directive: '',
          message: 'Invalid CSP: Empty or invalid CSP string provided',
          errorCode: ERROR_CODES.INVALID_CSP_STRING,
          suggestion: 'Check the CSP syntax and try again'
        });
        return result as CspValidationResponse;
      }

      // Parse the CSP string
      const directives = this.parseCsp(csp);
      result.parsedDirectives = { ...directives };

      // Update metadata based on directives
      this.updateMetadata(directives, result);

      // Validate directives
      this.validateDirectives(directives, result);

      // Generate recommendations
      this.generateRecommendations(directives, result);

      // Check if there are any errors
      result.isValid = result.errors.length === 0;

      // Cache the result if not in strict mode
      if (!options.strict) {
        validationResultCache.set(csp.trim(), { ...(result as CspValidationResponse) });
      }
    } catch (error) {
      this.addError(result, {
        directive: '',
        message: error instanceof Error ? error.message : 'Unknown error during CSP validation',
        errorCode: ERROR_CODES.VALIDATION_ERROR,
        suggestion: 'Check the CSP syntax and try again'
      });
      result.isValid = false;
    }

    return result as CspValidationResponse;
  }

  private addError(
    result: CspValidationResult, 
    error: Omit<CspValidationError, 'severity'> & { severity?: ValidationSeverity.ERROR }
  ): void {
    if (!result.meta) {
      result.meta = {
        cspLevel: '3',
        usesStrictDynamic: false,
        usesNoncesOrHashes: false,
        allowsUnsafeInline: [],
        allowsUnsafeEval: []
      };
    }
    
    const validationError: CspValidationError = {
      directive: error.directive || '',
      message: error.message,
      severity: ValidationSeverity.ERROR,
      errorCode: error.errorCode || ERROR_CODES.VALIDATION_ERROR,
      suggestion: error.suggestion || '',
      line: error.line,
      column: error.column,
      context: error.context
    };
    
    result.errors = result.errors || [];
    result.errors.push(validationError);
    
    // Mark result as invalid when we have errors
    result.isValid = false;
  }

  private addWarning(
    result: CspValidationResult, 
    warning: Omit<CspValidationWarning, 'severity'> & { severity?: ValidationSeverity.WARNING }
  ): void {
    if (!result.meta) {
      result.meta = {
        cspLevel: '3',
        usesStrictDynamic: false,
        usesNoncesOrHashes: false,
        allowsUnsafeInline: [],
        allowsUnsafeEval: []
      };
    }
    
    const validationWarning: CspValidationWarning = {
      directive: warning.directive || '',
      message: warning.message,
      severity: ValidationSeverity.WARNING,
      warningCode: warning.warningCode || WARNING_CODES.MISSING_DEFAULT_SRC,
      suggestion: warning.suggestion || '',
      line: warning.line,
      column: warning.column,
      context: warning.context
    };
    
    result.warnings = result.warnings || [];
    result.warnings.push(validationWarning);
  }

  /**
   * Updates metadata based on parsed directives
   */
  private updateMetadata(directives: Record<string, string[]>, result: CspValidationResult): void {
    if (!result.meta) {
      result.meta = {
        cspLevel: '3',
        usesStrictDynamic: false,
        usesNoncesOrHashes: false,
        allowsUnsafeInline: [],
        allowsUnsafeEval: []
      };
    }

    // Update metadata based on directives
    result.meta.usesStrictDynamic = Object.entries(directives).some(([_, values]) => 
      values.some(v => v.includes('strict-dynamic'))
    );
    
    // Check for nonces or hashes
    const nonceOrHashPatterns = [
      /^'nonce-.*'$/,
      /^'sha256-.*'$/,
      /^'sha384-.*'$/,
      /^'sha512-.*'$/
    ];
    
    result.meta.usesNoncesOrHashes = Object.entries(directives).some(([_, values]) =>
      values.some(v => nonceOrHashPatterns.some(p => p.test(v)))
    );
    
    // Track which directives allow unsafe-inline and unsafe-eval
    result.meta.allowsUnsafeInline = [];
    result.meta.allowsUnsafeEval = [];
    
    Object.entries(directives).forEach(([directive, values]) => {
      if (values.some(v => v.includes('unsafe-inline'))) {
        result.meta.allowsUnsafeInline.push(directive);
      }
      if (values.some(v => v.includes('unsafe-eval'))) {
        result.meta.allowsUnsafeEval.push(directive);
      }
    });
  }



  /**
   * Parses a CSP string into a directives object with optimized parsing
   * @param csp The CSP string to parse
   * @returns Object with directive names as keys and arrays of source expressions as values
   */
  private parseCsp(csp: string): Record<string, string[]> {
    // Check for empty or invalid input
    if (!csp || typeof csp !== 'string') {
      return {};
    }
    
    // Check cache first - use a simple hash for the cache key
    const cacheKey = csp.trim();
    const cached = parsedCspCache.get(cacheKey);
    if (cached) {
      return { ...cached }; // Return a copy to prevent direct modification
    }

    const directives: Record<string, string[]> = {};
    let inQuotes = false;
    let currentDirective = '';
    let currentValues: string[] = [];
    let currentValue = '';

    for (let i = 0; i < csp.length; i++) {
      const char = csp[i];
      if (char === undefined) continue;
      
      // Toggle inQuotes flag when encountering quotes
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
        currentValue += char;
        continue;
      }

      // Process semicolon (end of directive) when not in quotes
      if (char === ';' && !inQuotes) {
        this.processDirective(currentDirective, currentValues, directives);
        currentDirective = '';
        currentValues = [];
        currentValue = '';
        continue;
      }

      // Process whitespace (separator) when not in quotes
      if ((char === ' ' || char === '\t' || char === '\n') && !inQuotes) {
        if (currentValue) {
          currentValues.push(currentValue);
          currentValue = '';
        }
        continue;
      }

      // If we haven't found the first space yet, we're still reading the directive name
      if (currentValue === '' && currentValues.length === 0 && currentDirective === '') {
        if (char === ' ' || char === '\t' || char === '\n') {
          continue; // Skip leading whitespace
        }
        currentDirective += char.toLowerCase();
      } else {
        currentValue += char;
      }
    }

    // Process the last directive
    if (currentDirective || currentValue) {
      if (currentValue) {
        currentValues.push(currentValue);
      }
      this.processDirective(currentDirective, currentValues, directives);
    }

    // Cache the result
    parsedCspCache.set(cacheKey, { ...directives });
    return { ...directives };
  }


  /**
   * Helper method to process and store a single directive
   * @private
   */
  private processDirective(name: string, values: string[], directives: Record<string, string[]>): void {
    if (!name) return;
    
    // Filter out empty strings and trim values
    const filteredValues = values
      .filter(Boolean)
      .map(v => v.trim())
      .filter(Boolean);
    
    if (filteredValues.length > 0) {
      directives[name] = filteredValues;
    } else if (name) {
      directives[name] = [];
    }
  }

  /**
   * Validates nonce values in CSP directives
   * @private
   */
  private validateNonce(nonce: string, directive: string, result: CspValidationResult): void {
    const noncePattern = /^'nonce-([A-Za-z0-9+/=_-])+[=]{0,2}'$/;
    if (!noncePattern.test(nonce)) {
      this.addError(result, {
        directive,
        message: `Invalid nonce value in ${directive}`,
        errorCode: ERROR_CODES.INVALID_NONCE,
        suggestion: 'Use a valid base64-encoded nonce value',
        context: { nonce }
      });
    }
  }

  /**
   * Validates hash values in CSP directives
   * @private
   */
  private validateHash(hash: string, directive: string, result: CspValidationResult): void {
    const hashPattern = /^'(sha256|sha384|sha512)-[A-Za-z0-9+/=]+'$/;
    if (!hashPattern.test(hash)) {
      this.addError(result, {
        directive,
        message: `Invalid hash value in ${directive}`,
        errorCode: ERROR_CODES.INVALID_HASH,
        suggestion: 'Use a valid hash value (sha256-, sha384-, or sha512- prefix with base64 value)',
        context: { hash }
      });
    }
  }

  /**
   * Validates reporting endpoints
   * @private
   */
  private validateReportingEndpoints(directives: Record<string, string[]>, result: CspValidationResult): void {
    const hasReportTo = 'report-to' in directives;
    const hasReportUri = 'report-uri' in directives;
    
    if (hasReportUri && !hasReportTo) {
      this.addWarning(result, {
        directive: 'report-uri',
        message: 'report-uri is deprecated in favor of report-to',
        warningCode: WARNING_CODES.DEPRECATED_REPORT_URI,
        suggestion: 'Use report-to directive instead of report-uri'
      });
    }

    if (!hasReportTo && !hasReportUri) {
      this.addWarning(result, {
        directive: 'report-to',
        message: 'Missing reporting directive',
        warningCode: WARNING_CODES.MISSING_REPORT_TO,
        suggestion: 'Add report-to directive to monitor CSP violations'
      });
    }
  }

  /**
   * Validates security-related directives
   * @private
   */
  private validateSecurityDirectives(directives: Record<string, string[]>, result: CspValidationResult): void {
    const requiredDirectives = ['default-src'];
    const recommendedDirectives = ['object-src', 'base-uri', 'form-action', 'frame-ancestors'];
    
    // Check required directives
    requiredDirectives.forEach(directive => {
      if (!directives[directive]) {
        this.addWarning(result, {
          directive,
          message: `Missing required directive: ${directive}`,
          warningCode: WARNING_CODES.MISSING_REQUIRED_DIRECTIVE,
          suggestion: `Add the '${directive}' directive to your CSP`
        });
      }
    });

    // Check recommended directives
    recommendedDirectives.forEach(directive => {
      if (!directives[directive]) {
        this.addWarning(result, {
          directive,
          message: `Recommended directive missing: ${directive}`,
          warningCode: WARNING_CODES[`MISSING_${directive.replace(/-/g, '_').toUpperCase()}` as keyof typeof WARNING_CODES],
          suggestion: `Consider adding '${directive}' directive for better security`
        });
      }
    });
  }

  /**
   * Validates source expressions in directives
   * @private
   */
  private validateSourceExpressions(directive: string, values: string[], result: CspValidationResult): void {
    const insecureProtocols = ['http:', 'ws:'];
    const deprecatedSources = ['*', 'data:', 'unsafe-inline', 'unsafe-eval'];
    
    values.forEach(value => {
      // Skip empty values
      if (!value.trim()) return;

      // Check for deprecated sources
      if (deprecatedSources.some(deprecated => value.includes(deprecated))) {
        this.addWarning(result, {
          directive,
          message: `Deprecated source '${value}' in ${directive}`,
          warningCode: WARNING_CODES.DEPRECATED_SOURCE,
          suggestion: 'Use more restrictive sources for better security'
        });
      }

      // Check for insecure protocols
      if (insecureProtocols.some(proto => value.startsWith(proto))) {
        this.addError(result, {
          directive,
          message: `Insecure protocol in ${directive}: ${value}`,
          errorCode: ERROR_CODES.INSECURE_SOURCE,
          suggestion: 'Use secure protocols (https:, wss:) instead'
        });
      }

      // Validate nonce values
      if (value.startsWith('nonce-')) {
        this.validateNonce(value, directive, result);
      }
      
      // Validate hash values
      if (value.startsWith('sha256-') || value.startsWith('sha384-') || value.startsWith('sha512-')) {
        this.validateHash(value, directive, result);
      }

      // Check for mixed content
      if (value.includes('http:') && value.includes('https:')) {
        this.addError(result, {
          directive,
          message: `Mixed content detected in ${directive}`,
          errorCode: ERROR_CODES.MIXED_CONTENT,
          suggestion: 'Use consistent protocol (preferably HTTPS) for all sources'
        });
      }
    });
  }

  /**
   * Gets validation rules, loading them if not already loaded
   * @private
   */
  private getValidationRules(): ValidationRule[] {
    if (validationRules) {
      return validationRules;
    }

    // Define validation rules lazily
    validationRules = [
      {
        name: 'security-directives',
        validate: this.validateSecurityDirectives.bind(this)
      },
      {
        name: 'reporting-endpoints',
        validate: this.validateReportingEndpoints.bind(this)
      },
      {
        name: 'source-expressions',
        validate: (directives, result) => {
          Object.entries(directives).forEach(([directive, values]) => {
            if (values.length > 0) {
              this.validateSourceExpressions(directive, values, result);
            }
          });
        }
      },
      {
        name: 'script-src-directive',
        validate: (directives, result) => {
          if (directives['script-src']) {
            this.validateScriptSrcDirective(directives['script-src'], result);
          }
        }
      },
      {
        name: 'style-src-directive',
        validate: (directives, result) => {
          if (directives['style-src']) {
            this.validateStyleSrcDirective(directives['style-src'], result);
          }
        }
      }
    ];

    return validationRules;
  }

  /**
   * Validates directives using lazy-loaded rules
   * @private
   */
  private validateDirectives(directives: Record<string, string[]>, result: CspValidationResult): void {
    const rules = this.getValidationRules();
    
    // Execute each validation rule
    for (const rule of rules) {
      try {
        rule.validate(directives, result);
      } catch (error) {
        console.error(`Error executing validation rule ${rule.name}:`, error);
      }
    }
  }

  /**
   * Validates script-src directive specifically
   * @private
   */
  private validateScriptSrcDirective(values: string[], result: CspValidationResult): void {
    const hasUnsafeInline = values.includes('unsafe-inline');
    const hasStrictDynamic = values.includes('strict-dynamic');
    const hasNonceOrHash = values.some(v => v.startsWith('nonce-') || v.startsWith('sha'));

    if (hasUnsafeInline && !hasStrictDynamic && !hasNonceOrHash) {
      this.addWarning(result, {
        directive: 'script-src',
        message: 'unsafe-inline without nonce, hash or strict-dynamic',
        warningCode: WARNING_CODES.UNSAFE_INLINE_WITHOUT_STRICT_DYNAMIC,
        suggestion: 'Use nonces, hashes, or strict-dynamic instead of unsafe-inline'
      });
    }
  }

  /**
   * Validates style-src directive specifically
   * @private
   */
  private validateStyleSrcDirective(values: string[], result: CspValidationResult): void {
    const hasUnsafeInline = values.includes('unsafe-inline');
    const hasNonceOrHash = values.some(v => v.startsWith('nonce-') || v.startsWith('sha'));

    if (hasUnsafeInline && !hasNonceOrHash) {
      this.addWarning(result, {
        directive: 'style-src',
        message: 'unsafe-inline without nonce or hash',
        warningCode: WARNING_CODES.UNSAFE_INLINE,
        suggestion: 'Use nonces or hashes instead of unsafe-inline'
      });
    }
  }

  /**
   * Generates security recommendations based on the validation results
   * @private
   */
  /**
   * Clears the validation cache
   * Can be called when memory usage needs to be managed
   */
  public clearCache(): void {
    parsedCspCache.clear();
    validationResultCache.clear();
  }

  private generateRecommendations(directives: Record<string, string[]>, result: CspValidationResult): void {
    const recommendations: string[] = [];

    // Check for unsafe-inline in script-src
    if (directives['script-src']?.includes('unsafe-inline') && 
        !directives['script-src']?.some(v => v.startsWith('nonce-') || v.startsWith('sha'))) {
      recommendations.push(
        'Consider replacing \'unsafe-inline\' in script-src with nonces or hashes for better security.'
      );
    }

    // Check for unsafe-eval
    if (directives['script-src']?.includes('unsafe-eval')) {
      recommendations.push(
        'Avoid using \'unsafe-eval\' in script-src as it allows execution of dynamic code. ' +
        'Refactor code to use safer alternatives.'
      );
    }

    // Check for missing object-src
    if (!directives['object-src']) {
      recommendations.push(
        'Add object-src directive to prevent injection of plugins. ' +
        'Consider using \'object-src \'none\'\' for maximum security.'
      );
    }

    // Check for missing frame-ancestors
    if (!directives['frame-ancestors']) {
      recommendations.push(
        'Consider adding frame-ancestors directive to control which sites can embed your content. ' +
        'For example: \'frame-ancestors \'self\'\''
      );
    }

    // Check for missing default-src
    if (!directives['default-src']) {
      recommendations.push(
        'Add a default-src directive as a fallback for other fetch directives. ' +
        'This provides a security baseline for your CSP.'
      );
    }

    // Check for mixed content issues
    const hasHttp = Object.entries(directives).some(([_, values]) => 
      values.some(v => v.startsWith('http:'))
    );
    const hasHttps = Object.entries(directives).some(([_, values]) => 
      values.some(v => v.startsWith('https:'))
    );
    
    if (hasHttp && hasHttps) {
      recommendations.push(
        'Mixed content detected: both HTTP and HTTPS sources are specified. ' +
        'Consider using HTTPS exclusively for all sources.'
      );
    }

    // Check for deprecated report-uri
    if (directives['report-uri'] && !directives['report-to']) {
      recommendations.push(
        'The report-uri directive is deprecated in favor of report-to. ' +
        'Consider migrating to the newer Reporting API.'
      );
    }

    // Add recommendations to the result
    if (recommendations.length > 0) {
      result.recommendations = [...(result.recommendations || []), ...recommendations];
    }
  }
}

export default CspValidator;
