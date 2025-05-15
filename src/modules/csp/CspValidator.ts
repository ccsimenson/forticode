import { 
  IpcChannels, 
  CspValidationRequest, 
  CspValidationError, 
  CspValidationWarning, 
  ValidationSeverity,
  ParsedDirective
} from '@shared/ipc';
import { 
  CspFixSuggestion, 
  CspValidationResponseWithFixes 
} from './types';
import { ipcMain } from 'electron';

// Constants for CSP validation
// Note: These are kept for reference but not currently used in the validation logic
// as we're now using a different approach to determine CSP levels

// Define all standard CSP directive names
type CspDirectiveName = 
  // Fetch directives
  | 'child-src' | 'connect-src' | 'default-src' | 'font-src' | 'frame-src' 
  | 'img-src' | 'manifest-src' | 'media-src' | 'object-src' | 'prefetch-src' 
  | 'script-src' | 'script-src-elem' | 'script-src-attr' | 'style-src' 
  | 'style-src-elem' | 'style-src-attr' | 'worker-src'
  // Document directives
  | 'base-uri' | 'plugin-types' | 'sandbox'
  // Navigation directives
  | 'form-action' | 'frame-ancestors' | 'navigate-to'
  // Reporting directives
  | 'report-uri' | 'report-to'
  // Other directives
  | 'block-all-mixed-content' | 'require-sri-for' | 'require-trusted-types-for' 
  | 'trusted-types' | 'upgrade-insecure-requests' | 'webrtc' | 'referrer';

// CSP source expressions
// Extend the base response type to include fix suggestions
type CspValidationResponse = CspValidationResponseWithFixes;

interface CspSourceExpression {
  value: string;
  type: 'keyword' | 'scheme' | 'host' | 'nonce' | 'hash' | 'quoted';
  valid: boolean;
  error?: string;
}

// Enhanced parsed directive with validation info
interface EnhancedParsedDirective extends ParsedDirective {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parsedValues: CspSourceExpression[];
}

// Cache for regex patterns and other expensive operations
interface Cache {
  regex: { [key: string]: RegExp };
  parsedCsp: Map<string, EnhancedParsedDirective[]>;
  parsedHtml: Map<string, { scripts: InlineScript[]; styles: InlineStyle[] }>;
}

// Inline script information
interface InlineScript {
  content: string;
  line: number;
  column: number;
  hasNonce: boolean;
  hasHash: boolean;
}

// Inline style information
interface InlineStyle {
  content: string;
  line: number;
  column: number;
  hasNonce: boolean;
  hasHash: boolean;
}

// HTML parsing patterns
const HTML_PATTERNS = {
  // Match inline script tags
  INLINE_SCRIPT: /<script\b[^>]*>(.*?)<\/script>/gis,
  // Match script tags with src attribute
  EXTERNAL_SCRIPT: /<script\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"][^>]*>/gi,
  // Match inline style tags
  INLINE_STYLE: /<style\b[^>]*>(.*?)<\/style>/gis,
  // Match style attributes
  STYLE_ATTR: /\bstyle\s*=\s*['"]([^'"]+)['"]/gi,
  // Match event handler attributes
  EVENT_HANDLER: /\b(on[a-z]+)\s*=\s*['"]([^'"]+)['"]\s*\b/g,
  // Match javascript: URIs
  JAVASCRIPT_URI: /\b(javascript):[^\s'"<>]+/gi,
  // Match nonce attributes
  NONCE_ATTR: /\bnonce\s*=\s*['"]([^'"]+)['"]/i,
  // Match integrity attributes for SRI
  INTEGRITY_ATTR: /\bintegrity\s*=\s*['"]([^'"]+)['"]/i
} as const;

// Pre-compiled regex patterns
const CSP_PATTERNS = {
  // Directive parsing
  SPLIT_DIRECTIVES: /;(?=(?:(?:[^"]*"){2})*[^"]*$)(?=(?:(?:[^']*'){2})*[^']*$)/,
  SPLIT_VALUES: /\s+/,
  
  // Source expression matching
  KEYWORD: /^'([^']+)'$|^([a-z-]+)$/i,
  SCHEME: /^([a-z][a-z0-9+\-.]*):/i,
  HOST: /^([a-z0-9*.-]+)(?::(\d+))?$/i,
  NONCE: /^'nonce-([a-zA-Z0-9+/=_-]+)'$/,
  HASH: /^'((?:sha(?:256|384|512)|md5)-[a-zA-Z0-9+/=]+)'$/,
  QUOTED_STRINGS: /'[^']*'|"[^"]*"/g,
  
  // Special patterns
  UNSAFE_PATTERNS: {
    UNSAFE_INLINE: /'unsafe-inline'/, 
    UNSAFE_EVAL: /'unsafe-eval'/,
    UNSAFE_HASHES: /'unsafe-hashes'/,
    UNSAFE_ALLOW_REDIRECTS: /'unsafe-allow-redirects'/
  },
  
  // Validation patterns
  VALID_DIRECTIVE_NAME: /^[a-z-]+$/,
  VALID_KEYWORD: /^(?:'self'|'unsafe-inline'|'unsafe-eval'|'unsafe-hashes'|'unsafe-allow-redirects'|'strict-dynamic'|'report-sample'|'wasm-unsafe-eval'|'wasm-eval'|'none')$/,
  VALID_SCHEME: /^[a-z][a-z0-9+\-.]*:$/i,
  VALID_HOST: /^(?:\*|(?:\*\.[^*/]+|[^*/]+))(?:\/.*)?$/i,
  VALID_NONCE: /^'nonce-[a-zA-Z0-9+/=_-]+'$/,
  VALID_HASH: /^'(?:sha(?:256|384|512)|md5)-[a-zA-Z0-9+/=]+'$/
} as const;

export class CspValidator {
  private static instance: CspValidator;
  
  // Cache for expensive operations
  private cache: Cache = {
    regex: {},
    parsedCsp: new Map(),
    parsedHtml: new Map()
  };
  
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
  private validateCsp(csp: string, _filePath?: string): CspValidationResponse {
    // Initialize result with metadata
    const result: CspValidationResponse = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: [],
      parsedDirectives: {},
      originalCsp: csp,
      meta: {
        cspLevel: '1',
        usesStrictDynamic: false,
        usesNoncesOrHashes: false,
        allowsUnsafeInline: [],
        allowsUnsafeEval: []
      }
    };

    if (!csp) {
      this.addError(result, {
        directive: 'csp',
        errorCode: 'EMPTY_CSP',
        message: 'Empty CSP provided',
        severity: ValidationSeverity.ERROR,
        suggestion: 'Provide a valid Content Security Policy',
        documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
        line: 0,
        column: 0
      });
      return result;
    }

    try {
      // Parse the CSP directives
      const parsedDirectives = this.parseCsp(csp);
      
      // Update metadata based on parsed directives
      this.updateMetadata(result, parsedDirectives);
      
      // Perform validation checks
      this.validateDirectives(parsedDirectives, result);
      this.checkForMissingDirectives(parsedDirectives, result);
      this.checkDirectiveDependencies(parsedDirectives, result);
      this.checkForDeprecatedDirectives(parsedDirectives, result);
      this.checkForInsecureSources(parsedDirectives, result);
      this.checkForUnsafeDirectives(csp, result);
      
      // Generate recommendations
      this.generateRecommendations(result);
      
      // Generate fix suggestions for errors
      if (result.errors?.length) {
        const fixSuggestions = this.generateFixSuggestions(csp, result.errors);
        if (fixSuggestions.length > 0) {
          // Cast to any to avoid TypeScript errors with the extended type
          (result as any).fixSuggestions = fixSuggestions;
        }
      }
      
    } catch (error) {
      this.addError(result, {
        directive: 'csp',
        errorCode: 'PARSING_ERROR',
        message: 'Failed to parse CSP',
        severity: ValidationSeverity.ERROR,
        suggestion: 'Check the CSP syntax and try again',
        meta: { error: error instanceof Error ? error.message : String(error) },
        line: 0,
        column: 0
      });
    }
    
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
    // Initialize with all required directives
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

    // Safely handle options with array spread to ensure immutability
    if (options?.allowInlineScripts) {
      directives['script-src'] = [...(directives['script-src'] || []), "'unsafe-inline'"];
    }

    if (options?.allowEval) {
      directives['script-src'] = [...(directives['script-src'] || []), "'unsafe-eval'"];
    }

    if (options?.allowedDomains?.length) {
      const allowed = options.allowedDomains.filter(domain => 
        domain && domain.trim() !== '' && domain !== 'self'
      );
      
      if (allowed.length > 0) {
        directives['connect-src'] = [...(directives['connect-src'] || []), ...allowed];
        directives['img-src'] = [...(directives['img-src'] || []), ...allowed];
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
   * Updates metadata based on parsed directives
   */
  private updateMetadata(result: CspValidationResponse, directives: ParsedDirective[]): void {
    if (!result.meta) return;
    
    // Get the original CSP string from the result
    const csp = result.originalCsp || '';
    
    // Set CSP level based on features used
    if (csp.includes('strict-dynamic')) {
      result.meta['cspLevel'] = '3';
    } else if (csp.includes('frame-ancestors') || csp.includes('child-src')) {
      result.meta['cspLevel'] = '2';
    } else {
      result.meta['cspLevel'] = '1';
    }

    // Check for strict-dynamic usage
    result.meta['usesStrictDynamic'] = csp.includes('strict-dynamic');

    // Check for nonces or hashes
    result.meta['usesNoncesOrHashes'] = 
      csp.includes('nonce-') || 
      csp.includes('sha256-') || 
      csp.includes('sha384-') || 
      csp.includes('sha512-');

    // Initialize arrays if they don't exist
    if (!result.meta['allowsUnsafeInline']) {
      result.meta['allowsUnsafeInline'] = [];
    }
    if (!result.meta['allowsUnsafeEval']) {
      result.meta['allowsUnsafeEval'] = [];
    }

    // Check for unsafe-inline and unsafe-eval in directives
    for (const directive of directives) {
      if (directive.name === 'script-src' || directive.name === 'style-src') {
        if (directive.values.some(v => v.includes('unsafe-inline'))) {
          (result.meta['allowsUnsafeInline'] as string[]).push(directive.name);
        }
        if (directive.values.some(v => v.includes('unsafe-eval'))) {
          (result.meta['allowsUnsafeEval'] as string[]).push(directive.name);
        }
      }
    }
  }
  
  /**
   * Adds a formatted error to the result
   */
  private addError(
    result: CspValidationResponse, 
    error: {
      directive: string;
      message: string;
      errorCode: string;
      severity?: ValidationSeverity.ERROR | ValidationSeverity.CRITICAL;
      line?: number;
      column?: number;
      suggestion?: string;
      documentationUrl?: string;
      meta?: Record<string, any>;
      warningCode?: never; // Ensure warningCode is not allowed
    }
  ): void {
    const severity = error.severity || ValidationSeverity.ERROR;
    
    // Create a proper CspValidationError with only the expected properties
    const validationError: CspValidationError = {
      directive: error.directive,
      message: error.message,
      severity,
      errorCode: error.errorCode,
      line: error.line,
      column: error.column,
      suggestion: error.suggestion,
      documentationUrl: error.documentationUrl,
      meta: error.meta
    };
    
    result.errors.push(validationError);
    result.isValid = false;
  }
  
  private addWarning(
    result: CspValidationResponse, 
    warning: {
      directive: string;
      message: string;
      warningCode: string;
      severity?: ValidationSeverity.WARNING | ValidationSeverity.INFO;
      line?: number;
      column?: number;
      suggestion?: string;
      documentationUrl?: string;
      meta?: Record<string, any>;
      errorCode?: never; // Ensure errorCode is not allowed
    }
  ): void {
    const severity = warning.severity || ValidationSeverity.WARNING;
    
    // Create a proper CspValidationWarning with only the expected properties
    const validationWarning: CspValidationWarning = {
      directive: warning.directive,
      message: warning.message,
      severity,
      warningCode: warning.warningCode,
      line: warning.line,
      column: warning.column,
      suggestion: warning.suggestion,
      documentationUrl: warning.documentationUrl,
      meta: warning.meta
    };
    
    result.warnings.push(validationWarning);
  }
  
  /**
   * Parses a CSP string into an array of directives
   * @param csp The CSP string to parse
   * @returns Array of parsed directives
   */
  private parseCsp(csp: string): EnhancedParsedDirective[] {
    if (!csp) return [];

    // Check cache first
    const cached = this.cache.parsedCsp.get(csp);
    if (cached) return cached as EnhancedParsedDirective[];

    const directives: EnhancedParsedDirective[] = [];
    const directiveStrings = csp
      .split(CSP_PATTERNS.SPLIT_DIRECTIVES)
      .map(s => s.trim())
      .filter(Boolean);

    for (const dirStr of directiveStrings) {
      const trimmed = dirStr.trim();
      if (!trimmed) continue;
      
      const parts = trimmed.split(CSP_PATTERNS.SPLIT_VALUES);
      if (parts.length === 0) continue;
      
      const name = (parts[0] || '').toLowerCase();
      
      // Skip if no name or invalid directive name
      if (!name || !CSP_PATTERNS.VALID_DIRECTIVE_NAME.test(name)) {
        continue;
      }
      
      const values = parts.slice(1);
      
      // Parse and validate values
      const parsedValues = this.parseSourceExpressions(values);
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Validate directive-specific rules
      this.validateDirective(name, parsedValues, errors, warnings);
      
      directives.push({
        name: name as CspDirectiveName,
        values,
        source: trimmed,
        startIndex: 0,
        endIndex: trimmed.length,
        line: 1,
        column: 1,
        valid: errors.length === 0,
        errors,
        warnings,
        parsedValues
      });
    }
    
    // Cache the result
    this.cache.parsedCsp.set(csp, directives);
    
    return directives;
  }
  
  /**
   * Parse and validate CSP source expressions
   */
  private parseSourceExpressions(values: string[]): CspSourceExpression[] {
    return values.map(value => {
      // Check for keywords like 'self', 'unsafe-inline', etc.
      const keywordMatch = value.match(CSP_PATTERNS.KEYWORD);
      if (keywordMatch) {
        // Check if it's a valid keyword
        const keyword = keywordMatch[1] || keywordMatch[2];
        const isValid = CSP_PATTERNS.VALID_KEYWORD.test(`'${keyword}'`);
        return {
          value,
          type: 'keyword',
          valid: isValid,
          error: isValid ? undefined : `Invalid keyword: ${value}`
        };
      }
      
      // Check for schemes (http:, https:, data:, etc.)
      if (CSP_PATTERNS.VALID_SCHEME.test(value)) {
        return {
          value,
          type: 'scheme',
          valid: true
        };
      }
      
      // Check for hosts (example.com, *.example.com, etc.)
      if (CSP_PATTERNS.VALID_HOST.test(value)) {
        return {
          value,
          type: 'host',
          valid: true
        };
      }
      
      // Check for nonces
      if (CSP_PATTERNS.VALID_NONCE.test(value)) {
        return {
          value,
          type: 'nonce',
          valid: true
        };
      }
      
      // Check for hashes
      if (CSP_PATTERNS.VALID_HASH.test(value)) {
        return {
          value,
          type: 'hash',
          valid: true
        };
      }
      
      // If we get here, it's an invalid source expression
      return {
        value,
        type: 'quoted',
        valid: false,
        error: `Invalid source expression: ${value}`
      };
    });
  }
  
  /**
   * Validate directive-specific rules
   */
  private validateDirective(
    name: string, 
    values: CspSourceExpression[],
    errors: string[],
    warnings: string[]
  ): void {
    // Check for required values
    if (values.length === 0 && name !== 'sandbox') {
      errors.push(`Directive '${name}' must have at least one value`);
      return;
    }
    
    // Check for invalid values
    const invalidValues = values.filter(v => !v.valid);
    invalidValues.forEach(v => {
      if (v.error) {
        errors.push(v.error);
      }
    });
    
    // Special validation for certain directives
    if (name === 'script-src' || name === 'style-src') {
      const hasUnsafeInline = values.some(v => 
        v.type === 'keyword' && 
        (v.value === "'unsafe-inline'" || v.value === 'unsafe-inline')
      );
      
      if (hasUnsafeInline) {
        warnings.push(`'unsafe-inline' is not recommended in ${name} directive`);
      }
    }
    
    // Validate report-uri and report-to directives
    if (name === 'report-uri' || name === 'report-to') {
      if (values.length === 0) {
        errors.push(`Directive '${name}' must specify at least one endpoint`);
      }
    }
  }

  /**
   * Analyzes HTML content for inline scripts and styles
   * @param html The HTML content to analyze
   * @returns Object containing arrays of inline scripts and styles
   */
  private analyzeHtmlContent(html: string): { scripts: InlineScript[]; styles: InlineStyle[] } {
    // Check cache first
    const cached = this.cache.parsedHtml.get(html);
    if (cached) return cached;

    const scripts: InlineScript[] = [];
    const styles: InlineStyle[] = [];
    let match: RegExpExecArray | null;

    // Find inline scripts
    while ((match = HTML_PATTERNS.INLINE_SCRIPT.exec(html)) !== null) {
      const content = match[1]?.trim();
      if (!content) continue;
      
      const position = this.getPosition(html, match.index);
      const hasNonce = HTML_PATTERNS.NONCE_ATTR.test(match[0]);
      const hasHash = HTML_PATTERNS.INTEGRITY_ATTR.test(match[0]);
      
      scripts.push({
        content,
        line: position.line,
        column: position.column,
        hasNonce,
        hasHash
      });
    }

    // Find inline styles
    while ((match = HTML_PATTERNS.INLINE_STYLE.exec(html)) !== null) {
      const content = match[1]?.trim();
      if (!content) continue;
      
      const position = this.getPosition(html, match.index);
      const hasNonce = HTML_PATTERNS.NONCE_ATTR.test(match[0]);
      const hasHash = HTML_PATTERNS.INTEGRITY_ATTR.test(match[0]);
      
      styles.push({
        content,
        line: position.line,
        column: position.column,
        hasNonce,
        hasHash
      });
    }

    // Find style attributes
    while ((match = HTML_PATTERNS.STYLE_ATTR.exec(html)) !== null) {
      const content = match[1]?.trim();
      if (!content) continue;
      
      const position = this.getPosition(html, match.index);
      
      styles.push({
        content,
        line: position.line,
        column: position.column,
        hasNonce: false, // style attributes can't have nonces
        hasHash: false   // style attributes can't have hashes
      });
    }

    // Find event handlers
    HTML_PATTERNS.EVENT_HANDLER.lastIndex = 0; // Reset regex state
    while ((match = HTML_PATTERNS.EVENT_HANDLER.exec(html)) !== null) {
      const [fullMatch, _eventName, handler] = match;
      if (!handler) continue;
      
      const position = this.getPosition(html, match.index);
      
      scripts.push({
        content: handler,
        line: position.line,
        column: position.column + fullMatch.indexOf(handler),
        hasNonce: false,
        hasHash: false
      });
    }

    // Find javascript: URIs
    while ((match = HTML_PATTERNS.JAVASCRIPT_URI.exec(html)) !== null) {
      const position = this.getPosition(html, match.index);
      
      scripts.push({
        content: match[0],
        line: position.line,
        column: position.column,
        hasNonce: false,
        hasHash: false
      });
    }

    const result = { scripts, styles };
    this.cache.parsedHtml.set(html, result);
    return result;
  }

  /**
   * Gets the line and column number for a given character index in a string
   * @param str The input string
   * @param index The character index
   * @returns Object with line and column numbers (1-based)
   */
  private getPosition(str: string, index: number): { line: number; column: number } {
    // Handle invalid inputs
    if (typeof str !== 'string' || !Number.isInteger(index) || index < 0) {
      return { line: 1, column: 1 }; // Default to first line, first column for invalid inputs
    }
    
    // Cap index at string length to avoid issues
    const safeIndex = Math.min(index, str.length);
    
    // Get the substring up to the index and split by newlines
    const lines = str.substring(0, safeIndex).split('\n');
    
    // Handle empty array case (shouldn't happen due to previous checks, but TypeScript needs this)
    if (!lines.length) {
      return { line: 1, column: 1 };
    }
    
    // Get the last line safely
    const lastLine = lines[lines.length - 1] || '';
    
    // Calculate line and column (1-based)
    const lineNumber = lines.length;
    const columnNumber = lastLine.length + 1;
    
    return {
      line: lineNumber,
      column: columnNumber
    };
  }

  /**
   * Validates inline scripts and styles against CSP directives
   * @param html The HTML content to validate
   * @param csp The CSP string to validate against
   * @returns Object containing validation results
   */
  public validateInlineContent(html: string, csp: string): {
    valid: boolean;
    scriptIssues: Array<{ line: number; column: number; message: string }>;
    styleIssues: Array<{ line: number; column: number; message: string }>;
  } {
    const result = {
      valid: true,
      scriptIssues: [] as Array<{ line: number; column: number; message: string }>,
      styleIssues: [] as Array<{ line: number; column: number; message: string }>
    };

    const { scripts, styles } = this.analyzeHtmlContent(html);
    const directives = this.parseCsp(csp);
    
    // Check scripts
    for (const script of scripts) {
      if (script.hasNonce || script.hasHash) {
        // Script has a nonce or hash, which is good
        continue;
      }
      
      // Check if 'unsafe-inline' is allowed
      const scriptSrc = directives.find(d => d.name === 'script-src');
      const allowsUnsafeInline = scriptSrc?.values?.some(v => 
        v === "'unsafe-inline'" || v === 'unsafe-inline'
      ) ?? false;
      
      if (!allowsUnsafeInline) {
        result.valid = false;
        result.scriptIssues.push({
          line: script.line,
          column: script.column,
          message: 'Inline script without nonce or hash. Consider using nonces or hashes instead of unsafe-inline.'
        });
      }
    }
    
    // Check styles
    for (const style of styles) {
      if (style.hasNonce || style.hasHash) {
        // Style has a nonce or hash, which is good
        continue;
      }
      
      // Check if 'unsafe-inline' is allowed for styles
      const styleSrc = directives.find(d => d.name === 'style-src' || d.name === 'style-src-elem');
      const allowsUnsafeInline = styleSrc?.values?.some(v => 
        v === "'unsafe-inline'" || v === 'unsafe-inline'
      ) ?? false;
      
      if (!allowsUnsafeInline) {
        result.valid = false;
        result.styleIssues.push({
          line: style.line,
          column: style.column,
          message: 'Inline style without nonce or hash. Consider using nonces or hashes instead of unsafe-inline.'
        });
      }
    }
    
    return result;
  }

  /**
   * Checks for unsafe directives in the CSP
   */
  private checkForUnsafeDirectives(csp: string, result: CspValidationResponse): void {
    if (!csp) return;
    
    // Use pre-compiled regex patterns for better performance
    const unsafePatterns = [
      { 
        pattern: 'unsafe-inline',
        test: (s: string) => CSP_PATTERNS.UNSAFE_PATTERNS.UNSAFE_INLINE.test(s),
        message: 'Allows inline scripts which can be a security risk',
        suggestion: 'Use nonces or hashes instead of unsafe-inline',
        warningCode: 'UNSAFE_INLINE'
      },
      { 
        pattern: 'unsafe-eval',
        test: (s: string) => CSP_PATTERNS.UNSAFE_PATTERNS.UNSAFE_EVAL.test(s),
        message: 'Allows eval() which can be a security risk',
        suggestion: 'Avoid using eval() and similar functions',
        warningCode: 'UNSAFE_EVAL'
      },
      { 
        pattern: 'data:',
        test: (s: string) => s.includes('data:'),
        message: 'Allows data URIs which can be used for XSS attacks',
        suggestion: 'Restrict data: URIs to specific directives if absolutely necessary',
        warningCode: 'UNSAFE_DATA_URI'
      },
      { 
        pattern: ' *',
        test: (s: string) => /\s+\*\s*$/.test(s),
        message: 'Wildcard source can be dangerous if not properly scoped',
        suggestion: 'Specify exact sources instead of using wildcards',
        warningCode: 'UNSAFE_WILDCARD'
      }
    ] as const;

    // Use for...of with type assertion for better type safety and performance
    for (const item of unsafePatterns) {
      if (item.test(csp)) {
        this.addWarning(result, {
          directive: 'CSP',
          message: `Potentially unsafe directive: ${item.pattern}`,
          suggestion: item.suggestion,
          warningCode: item.warningCode,
          severity: ValidationSeverity.WARNING,
          meta: { 
            directive: item.pattern, 
            description: item.message 
          }
        });
      }
    }
  }

  /**
   * Checks for missing recommended directives
   */
  private checkForMissingDirectives(directives: ParsedDirective[], result: CspValidationResponse): void {
    if (!directives.length) return;
    
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
    ] as const;

    const presentDirectives = new Set(directives.map(d => d.name.toLowerCase()));
    const missingDirectives = recommendedDirectives.filter(d => 
      !presentDirectives.has(d.toLowerCase())
    );

    missingDirectives.forEach(directive => {
      this.addWarning(result, {
        directive,
        message: `Missing recommended directive: ${directive}`,
        suggestion: 'Add this directive to your CSP for better security.',
        warningCode: 'MISSING_RECOMMENDED_DIRECTIVE',
        severity: ValidationSeverity.WARNING
      });
    });
  }

  /**
   * Checks for deprecated directives
   * @param directives Array of parsed directives to check
   * @param result Validation result object to populate with warnings
   * @private
   */
  private checkForDeprecatedDirectives(directives: ParsedDirective[], result: CspValidationResponse): void {
    if (!directives?.length) return;
    
    type DeprecatedDirective = {
      directive: CspDirectiveName;
      replacement: string;
    };

    const deprecatedDirectives: DeprecatedDirective[] = [
      { directive: 'plugin-types' as CspDirectiveName, replacement: 'object-src and/or media-src' },
      { directive: 'report-uri' as CspDirectiveName, replacement: 'report-to' }
    ];
    
    // Check for referrer directive separately since it's not a standard CSP directive
    const referrerDirective = directives.find(d => d.name.toLowerCase() === 'referrer');
    if (referrerDirective) {
      this.addWarning(result, {
        directive: 'referrer' as CspDirectiveName, // Type assertion needed for non-standard directive
        message: 'The referrer directive is not a standard CSP directive',
        suggestion: 'Use the Referrer-Policy header instead',
        warningCode: 'DEPRECATED_DIRECTIVE',
        severity: ValidationSeverity.WARNING,
        meta: {
          directive: 'referrer',
          replacement: 'Referrer-Policy header'
        }
      });
    }

    const directiveNames = new Set(directives.map(d => d.name.toLowerCase()));
    
    for (const { directive, replacement } of deprecatedDirectives) {
      if (directiveNames.has(directive.toLowerCase())) {
        const deprecatedDirective = directives.find(d => d.name.toLowerCase() === directive.toLowerCase());
        this.addWarning(result, {
          directive,
          message: `Deprecated directive: ${directive}`,
          suggestion: `Replace '${directive}' with '${replacement}'.`,
          warningCode: 'DEPRECATED_DIRECTIVE',
          severity: ValidationSeverity.WARNING,
          line: deprecatedDirective?.line,
          column: deprecatedDirective?.column
        });
      }
    }
  }

  /**
   * Checks for directive dependencies and ensures required directives are present
   * @param directives Array of parsed directives
   * @param result Validation result object to populate with errors/warnings
   */
  private checkDirectiveDependencies(directives: ParsedDirective[], result: CspValidationResponse): void {
    if (!directives?.length) return;
    
    // Check for required directive combinations
    const hasScriptSrc = directives.some(d => d.name.toLowerCase() === 'script-src');
    const hasDefaultSrc = directives.some(d => d.name.toLowerCase() === 'default-src');
    
    if (!hasScriptSrc && !hasDefaultSrc) {
      this.addWarning(result, {
        directive: 'script-src',
        message: 'Missing script-src or default-src directive',
        suggestion: 'Add script-src or default-src to control script execution',
        warningCode: 'MISSING_SCRIPT_SRC',
        severity: ValidationSeverity.WARNING
      });
    }
  }

  /**
   * Checks for insecure sources in the CSP directives
   * @param directives Array of parsed directives to check
   * @param result Validation result object to populate with warnings
   */
  private checkForInsecureSources(directives: ParsedDirective[], result: CspValidationResponse): void {
    if (!directives?.length) return;
    
    type InsecurePatternType = 'protocol' | 'source' | 'directive';
    
    interface InsecurePattern {
      pattern: string;
      message: string;
      type: InsecurePatternType;
      test: (value: string, directive?: ParsedDirective) => boolean;
    }
    
    // Define insecure patterns with their test functions
    const insecurePatterns: InsecurePattern[] = [
      // Protocol-based patterns
      {
        pattern: 'http://',
        message: 'Insecure HTTP protocol',
        type: 'protocol',
        test: (value) => typeof value === 'string' && value.includes('http://')
      },
      {
        pattern: '*.example.com',
        message: 'Wildcard subdomains can be insecure',
        type: 'source',
        test: (value) => typeof value === 'string' && /\*\.\w+\./.test(value)
      },
      
      // Common unsafe directives
      {
        pattern: 'unsafe-inline',
        message: 'Allows inline scripts which can be a security risk',
        type: 'directive',
        test: (value) => value === 'unsafe-inline'
      },
      {
        pattern: 'unsafe-eval',
        message: 'Allows eval() which can be a security risk',
        type: 'directive',
        test: (value) => value === 'unsafe-eval'
      },
      
      // Insecure sources
      {
        pattern: 'data:',
        message: 'Allows data URIs which can be used for XSS attacks',
        type: 'source',
        test: (value) => typeof value === 'string' && value.startsWith('data:')
      },
      {
        pattern: 'blob:',
        message: 'Allows blob URIs which can be used for XSS attacks',
        type: 'source',
        test: (value) => typeof value === 'string' && value.startsWith('blob:')
      },
      
      // Other unsafe patterns
      {
        pattern: 'unsafe-hashes',
        message: 'Allows unsafe hashes which can be bypassed',
        type: 'directive',
        test: (value) => value === 'unsafe-hashes'
      },
      {
        pattern: 'strict-dynamic',
        message: 'Uses strict-dynamic without nonce or hash',
        type: 'directive',
        test: (value, currentDirective) => {
          if (value !== 'strict-dynamic' || !currentDirective) return false;
          return currentDirective.values.every((v: unknown) => 
            typeof v === 'string' && 
            !v.startsWith('\'nonce-') && 
            !v.startsWith('sha256-')
          );
        }
      },
      {
        pattern: 'unsafe-allow-redirects',
        message: 'Allows unsafe redirects which can bypass CSP',
        type: 'directive',
        test: (value) => value === 'unsafe-allow-redirects'
      },
      {
        pattern: 'wasm-unsafe-eval',
        message: 'Allows WebAssembly compilation which can be used for code injection',
        type: 'directive',
        test: (value) => value === 'wasm-unsafe-eval'
      }
    ];

    // Check each directive's values against insecure patterns
    for (const directive of directives) {
      if (!directive.values?.length) continue;
      
      for (const value of directive.values) {
        // Skip non-string values
        if (typeof value !== 'string') continue;
        
        for (const pattern of insecurePatterns) {
          try {
            if (pattern.test(value, pattern.pattern === 'strict-dynamic' ? directive : undefined)) {
              const severity = pattern.type === 'protocol' ? ValidationSeverity.ERROR : 
                             pattern.type === 'source' ? ValidationSeverity.WARNING : ValidationSeverity.INFO;
              
              if (severity === ValidationSeverity.ERROR) {
                this.addError(result, {
                  directive: directive.name,
                  message: `Insecure pattern detected: ${pattern.pattern} - ${pattern.message}`,
                  errorCode: `INSECURE_${pattern.type.toUpperCase()}`,
                  severity: ValidationSeverity.ERROR,
                  line: directive.line,
                  column: directive.column,
                  suggestion: `Remove or replace '${pattern.pattern}' with a more secure alternative`,
                  documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP/Using_Content_Security_Policy'
                });
              } else {
                this.addWarning(result, {
                  directive: directive.name,
                  message: `Insecure pattern detected: ${pattern.pattern} - ${pattern.message}`,
                  warningCode: `INSECURE_${pattern.type.toUpperCase()}`,
                  severity: ValidationSeverity.WARNING,
                  line: directive.line,
                  column: directive.column,
                  suggestion: `Remove or replace '${pattern.pattern}' with a more secure alternative`,
                  documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP/Using_Content_Security_Policy'
                });
              }
              // Move to next value after finding a match
              break;
            }
          } catch (error) {
            // Log error but continue with other patterns
            console.error(`Error checking pattern ${pattern.pattern}:`, error);
          }
        }
      }
    }
  }

  /**
   * Registers IPC handlers for CSP-related operations
   */
  public registerIpcHandlers(ipcMainInstance: typeof ipcMain): void {
    // Handle CSP validation requests
    ipcMainInstance.handle(IpcChannels.CSP_VALIDATE, async (_, request: CspValidationRequest) => {
      try {
        return this.validateCsp(request.csp, request.filePath);
      } catch (error) {
        console.error('Error validating CSP:', error);
        return {
          isValid: false,
          errors: [{
            directive: 'csp',
            errorCode: 'VALIDATION_ERROR',
            message: 'Error validating CSP',
            suggestion: 'Check the console for more details',
            severity: ValidationSeverity.ERROR
          }],
          warnings: [],
          recommendations: [],
          parsedDirectives: {},
          originalCsp: request.csp,
          meta: {
            cspLevel: '1',
            usesStrictDynamic: false,
            usesNoncesOrHashes: false,
            allowsUnsafeInline: [],
            allowsUnsafeEval: []
          }
        };
      }
    });

    // Handle CSP generation requests
    ipcMainInstance.handle(IpcChannels.CSP_GENERATE, async (_, options: {
      allowInlineScripts?: boolean;
      allowEval?: boolean;
      allowedDomains?: string[];
    }) => {
      try {
        return this.generateSecureCsp(options);
      } catch (error) {
        console.error('Error generating CSP:', error);
        throw new Error('Failed to generate CSP');
      }
    });
  }
  
  /**
   * Validates CSP directives and their values
   */
  private validateDirectives(directives: ParsedDirective[], result: CspValidationResponse): void {
    const validDirectivePattern = /^[a-zA-Z-]+$/;
    
    for (const directive of directives) {
      // Check for invalid directive names
      if (!validDirectivePattern.test(directive.name)) {
        this.addError(result, {
          directive: directive.name,
          errorCode: 'INVALID_DIRECTIVE_NAME',
          message: `Invalid directive name: ${directive.name}`,
          suggestion: 'Directive names must contain only letters and hyphens.',
          severity: ValidationSeverity.ERROR,
          line: directive.line,
          column: directive.column
        });
      }
      
      // Check for empty values
      if (directive.values.length === 0) {
        this.addWarning(result, {
          directive: directive.name,
          message: `Empty directive: ${directive.name}`,
          suggestion: 'Remove the directive or add valid values.',
          warningCode: 'EMPTY_DIRECTIVE',
          severity: ValidationSeverity.WARNING,
          line: directive.line,
          column: directive.column
        });
      }
    }
  }
  
  /**
   * Generates recommendations based on the validation results
   */
  private generateRecommendations(result: CspValidationResponse): void {
    if (!result.meta) {
      return;
    }
    
    const meta = result.meta;
    const recommendations: string[] = [];
    
    // Generate recommendations based on validation results
    const unsafeInline = meta['allowsUnsafeInline'] as string[] | undefined;
    if (unsafeInline && unsafeInline.length > 0) {
      recommendations.push(
        `Consider removing 'unsafe-inline' from ${unsafeInline.join(', ')} and using nonces or hashes instead`
      );
    }

    const unsafeEval = meta['allowsUnsafeEval'] as string[] | undefined;
    if (unsafeEval && unsafeEval.length > 0) {
      recommendations.push(
        `Consider removing 'unsafe-eval' from ${unsafeEval.join(', ')} and refactoring code to avoid eval()`
      );
    }

    // Check CSP level and recommend upgrades
    const cspLevel = meta['cspLevel'] as string | undefined;
    if (cspLevel === '1') {
      recommendations.push('Consider upgrading to CSP Level 2 or 3 for enhanced security features');
    } else if (cspLevel === '2' && !meta['usesStrictDynamic']) {
      recommendations.push('Consider using CSP Level 3 features like strict-dynamic for better security');
    }
    
    // Only update if we have recommendations
    if (recommendations.length > 0) {
      result.recommendations = [...(result.recommendations || []), ...recommendations];
    }
  }

  /**
   * Generates fix suggestions for CSP issues
   * @param csp The original CSP string
   * @param issues Array of validation issues
   * @returns Array of fix suggestions
   */
  private generateFixSuggestions(csp: string, issues: CspValidationError[]): CspFixSuggestion[] {
    const suggestions: CspFixSuggestion[] = [];
    
    for (const issue of issues) {
      const suggestion: CspFixSuggestion = {
        issue: issue.message,
        severity: 'medium',
        fixes: []
      };
      
      // Handle unsafe-inline
      if (issue.message.includes('unsafe-inline')) {
        suggestion.fixes.push({
          description: 'Use nonces or hashes instead of unsafe-inline',
          fix: 'Add nonce-{random} or hash values',
          type: 'replace',
          directive: issue.directive,
          value: 'unsafe-inline'
        });
        suggestion.severity = 'high';
      }
      
      // Handle unsafe-eval
      if (issue.message.includes('unsafe-eval')) {
        suggestion.fixes.push({
          description: 'Refactor code to avoid eval() and similar functions',
          fix: 'Remove unsafe-eval',
          type: 'remove',
          directive: issue.directive,
          value: 'unsafe-eval'
        });
        suggestion.severity = 'high';
      }
      
      // Handle wildcard sources
      if (issue.message.includes('Wildcard source')) {
        const directives = this.parseCsp(csp);
        const directive = directives.find(d => d.name === issue.directive);
        if (directive) {
          suggestion.fixes.push({
            description: 'Replace wildcard with specific sources',
            fix: 'Replace * with specific domains',
            type: 'modify',
            directive: issue.directive,
            value: 'example.com'
          });
        }
        suggestion.severity = 'medium';
      }
      
      // Handle missing directives
      if (issue.message.includes('missing directive')) {
        const directiveMatch = issue.message.match(/directive '([^']+)'/);
        if (directiveMatch && directiveMatch[1]) {
          const directive = directiveMatch[1];
          let defaultValue = '';
          
          // Provide secure defaults for common directives
          switch (directive) {
            case 'default-src':
              defaultValue = "'self'";
              break;
            case 'script-src':
              defaultValue = "'self' 'unsafe-inline' 'unsafe-eval'";
              break;
            case 'style-src':
              defaultValue = "'self' 'unsafe-inline'";
              break;
            case 'img-src':
              defaultValue = "'self' data:";
              break;
            case 'connect-src':
              defaultValue = "'self'";
              break;
            case 'font-src':
              defaultValue = "'self' data:";
              break;
            case 'object-src':
              defaultValue = "'none'";
              break;
            case 'frame-ancestors':
              defaultValue = "'self'";
              break;
            default:
              defaultValue = "'self'";
          }
          
          suggestion.fixes.push({
            description: `Add ${directive} directive with secure defaults`,
            fix: `${directive} ${defaultValue}`,
            type: 'add',
            directive
          });
          
          suggestion.severity = directive === 'default-src' ? 'high' : 'medium';
        }
      }
      
      // Only add the suggestion if we have fixes
      if (suggestion.fixes.length > 0) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  }
}
