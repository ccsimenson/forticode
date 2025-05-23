import { ValidationSeverity } from '../../shared/ipc.js';
type CspLevel = '1' | '2' | '3';
type CspDirective = 'default-src' | 'script-src' | 'style-src' | 'img-src' | 'connect-src' | 'font-src' | 'object-src' | 'media-src' | 'frame-src' | 'child-src' | 'frame-ancestors' | 'form-action' | 'base-uri' | 'sandbox' | 'report-uri' | 'report-to' | 'worker-src' | 'manifest-src' | 'prefetch-src' | 'navigate-to' | 'script-src-attr' | 'script-src-elem' | 'style-src-attr' | 'style-src-elem';
type CspSourceExpression = "'none'" | "'self'" | "'unsafe-inline'" | "'unsafe-eval'" | "'strict-dynamic'" | "'unsafe-hashes'" | "'report-sample'" | "'wasm-unsafe-eval'" | `'nonce-${string}'` | `'sha256-${string}'` | `'sha384-${string}'` | `'sha512-${string}'` | 'http:' | 'https:' | 'data:' | 'blob:' | 'filesystem:' | 'mediastream:' | `http://${string}` | `https://${string}` | 'self' | 'unsafe-inline' | 'unsafe-eval' | string;
export type { CspDirective, CspSourceExpression };
declare const ERROR_CODES: {
    readonly INVALID_CSP_STRING: "INVALID_CSP_STRING";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly INVALID_DIRECTIVE: "INVALID_DIRECTIVE";
    readonly INVALID_SOURCE_EXPRESSION: "INVALID_SOURCE_EXPRESSION";
    readonly MISSING_REQUIRED_DIRECTIVE: "MISSING_REQUIRED_DIRECTIVE";
    readonly DEPRECATED_DIRECTIVE: "DEPRECATED_DIRECTIVE";
    readonly UNNECESSARY_DIRECTIVE: "UNNECESSARY_DIRECTIVE";
    readonly INSECURE_SOURCE: "INSECURE_SOURCE";
    readonly MISSING_REPORTING: "MISSING_REPORTING";
    readonly MIXED_CONTENT: "MIXED_CONTENT";
    readonly INVALID_NONCE: "INVALID_NONCE";
    readonly INVALID_HASH: "INVALID_HASH";
    readonly DEPRECATED_SOURCE: "DEPRECATED_SOURCE";
    readonly BROWSER_COMPATIBILITY: "BROWSER_COMPATIBILITY";
    readonly INVALID_REPORTING_ENDPOINT: "INVALID_REPORTING_ENDPOINT";
    readonly INVALID_SANDBOX: "INVALID_SANDBOX";
    readonly INVALID_TRUSTED_TYPES: "INVALID_TRUSTED_TYPES";
    readonly INSECURE_SCRIPT_SRC: "INSECURE_SCRIPT_SRC";
    readonly INSECURE_STYLE_SRC: "INSECURE_STYLE_SRC";
    readonly INSECURE_IMG_SRC: "INSECURE_IMG_SRC";
    readonly INSECURE_FONT_SRC: "INSECURE_FONT_SRC";
    readonly INSECURE_CONNECT_SRC: "INSECURE_CONNECT_SRC";
    readonly INSECURE_MEDIA_SRC: "INSECURE_MEDIA_SRC";
    readonly INSECURE_OBJECT_SRC: "INSECURE_OBJECT_SRC";
    readonly INSECURE_FRAME_SRC: "INSECURE_FRAME_SRC";
    readonly INSECURE_CHILD_SRC: "INSECURE_CHILD_SRC";
};
type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
declare const WARNING_CODES: {
    readonly MISSING_DEFAULT_SRC: "MISSING_DEFAULT_SRC";
    readonly UNSAFE_INLINE: "UNSAFE_INLINE";
    readonly UNSAFE_EVAL: "UNSAFE_EVAL";
    readonly WILDCARD_SOURCE: "WILDCARD_SOURCE";
    readonly HTTP_SOURCE: "HTTP_SOURCE";
    readonly DEPRECATED_DIRECTIVE: "DEPRECATED_DIRECTIVE";
    readonly UNSAFE_INLINE_WITHOUT_STRICT_DYNAMIC: "UNSAFE_INLINE_WITHOUT_STRICT_DYNAMIC";
    readonly UNSAFE_EVAL_DETECTED: "UNSAFE_EVAL_DETECTED";
    readonly MISSING_REQUIRED_DIRECTIVE: "MISSING_REQUIRED_DIRECTIVE";
    readonly MISSING_OBJECT_SRC: "MISSING_OBJECT_SRC";
    readonly MISSING_BASE_URI: "MISSING_BASE_URI";
    readonly MISSING_FORM_ACTION: "MISSING_FORM_ACTION";
    readonly MISSING_FRAME_ANCESTORS: "MISSING_FRAME_ANCESTORS";
    readonly MISSING_REPORT_TO: "MISSING_REPORT_TO";
    readonly MISSING_REPORT_URI: "MISSING_REPORT_URI";
    readonly MIXED_CONTENT: "MIXED_CONTENT";
    readonly DEPRECATED_REPORT_URI: "DEPRECATED_REPORT_URI";
    readonly DEPRECATED_SOURCE: "DEPRECATED_SOURCE";
    readonly LEGACY_DIRECTIVE: "LEGACY_DIRECTIVE";
    readonly MISSING_TRUSTED_TYPES: "MISSING_TRUSTED_TYPES";
};
type WarningCode = typeof WARNING_CODES[keyof typeof WARNING_CODES];
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
}
export declare class CspValidator {
    /**
     * Registers IPC handlers for CSP validation
     * @param ipcMain The Electron ipcMain module
     */
    registerIpcHandlers(_ipcMain: typeof import('electron').ipcMain): void;
    private static instance;
    private constructor();
    static getInstance(): CspValidator;
    /**
     * Validates a CSP string against security best practices
     */
    validateCsp(csp: string, options?: CspValidationOptions): CspValidationResponse;
    private addError;
    private addWarning;
    /**
     * Updates metadata based on parsed directives
     */
    private updateMetadata;
    /**
     * Parses a CSP string into a directives object with optimized parsing
     * @param csp The CSP string to parse
     * @returns Object with directive names as keys and arrays of source expressions as values
     */
    private parseCsp;
    /**
     * Helper method to process and store a single directive
     * @private
     */
    private processDirective;
    /**
     * Validates nonce values in CSP directives
     * @private
     */
    private validateNonce;
    /**
     * Validates hash values in CSP directives
     * @private
     */
    private validateHash;
    /**
     * Validates reporting endpoints
     * @private
     */
    private validateReportingEndpoints;
    /**
     * Validates security-related directives
     * @private
     */
    private validateSecurityDirectives;
    /**
     * Validates source expressions in directives
     * @private
     */
    private validateSourceExpressions;
    /**
     * Gets validation rules, loading them if not already loaded
     * @private
     */
    private getValidationRules;
    /**
     * Validates directives using lazy-loaded rules
     * @private
     */
    private validateDirectives;
    /**
     * Validates script-src directive specifically
     * @private
     */
    private validateScriptSrcDirective;
    /**
     * Validates style-src directive specifically
     * @private
     */
    private validateStyleSrcDirective;
    /**
     * Generates security recommendations based on the validation results
     * @private
     */
    /**
     * Clears the validation cache
     * Can be called when memory usage needs to be managed
     */
    clearCache(): void;
    private generateRecommendations;
}
export default CspValidator;
//# sourceMappingURL=CspValidator.d.ts.map