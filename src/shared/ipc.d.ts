export declare enum IpcChannels {
    WINDOW_MINIMIZE = "window:minimize",
    WINDOW_MAXIMIZE = "window:maximize",
    WINDOW_CLOSE = "window:close",
    WINDOW_IS_MAXIMIZED = "window:is-maximized",
    FILE_OPEN = "file:open",
    FILE_SAVE = "file:save",
    CSP_VALIDATE = "csp:validate",
    CSP_GENERATE = "csp:generate",
    CSP_APPLY = "csp:apply",
    SECURITY_SCAN = "security:scan",
    SECURITY_FIX = "security:fix",
    GITHUB_AUTHENTICATE = "github:authenticate",
    GITHUB_SCAN_REPO = "github:scan-repo",
    GITHUB_GET_REPOS = "github:get-repos",
    SETTINGS_GET = "settings:get",
    SETTINGS_UPDATE = "settings:update",
    CHECK_FOR_UPDATES = "updates:check",
    DOWNLOAD_UPDATE = "updates:download",
    INSTALL_UPDATE = "updates:install"
}
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
export interface CspValidationRequest {
    csp: string;
    filePath?: string;
}
/** Severity levels for validation messages */
export declare enum ValidationSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
/** Source type for CSP directives */
export type CspSource = 'none' | 'self' | 'unsafe-inline' | 'unsafe-eval' | 'strict-dynamic' | `'nonce-${string}'` | `'${string}'` | `https://${string}` | `http://${string}` | `*.${string}` | string;
/** Base interface for validation messages */
export interface BaseValidationMessage {
    /** The directive this message applies to */
    directive: string;
    /** The actual message */
    message: string;
    /** Severity level */
    severity: ValidationSeverity;
    /** Line number in the original CSP */
    line?: number;
    /** Column number in the original CSP */
    column?: number;
    /** Offset in the original string */
    offset?: number;
    /** Length of the relevant text */
    length?: number;
    /** Suggestion for fixing the issue */
    suggestion?: string;
    /** Link to documentation */
    documentationUrl?: string;
    /** Additional context data */
    meta?: Record<string, any>;
}
/** Error information for CSP validation */
export interface CspValidationError extends BaseValidationMessage {
    severity: ValidationSeverity.ERROR | ValidationSeverity.CRITICAL;
    errorCode: string;
}
/** Warning information for CSP validation */
export interface CspValidationWarning extends BaseValidationMessage {
    severity: ValidationSeverity.WARNING | ValidationSeverity.INFO;
    warningCode: string;
}
/** Parsed CSP directive with metadata */
export interface ParsedDirective {
    /** Directive name */
    name: string;
    /** Directive values */
    values: CspSource[];
    /** Original source string */
    source: string;
    /** Start position in original CSP */
    startIndex: number;
    /** End position in original CSP */
    endIndex: number;
    /** Line number in original CSP */
    line?: number;
    /** Column number in original CSP */
    column?: number;
}
/** Validation result for CSP */
export interface CspValidationResponse {
    /** Whether the CSP is valid */
    isValid: boolean;
    /** List of errors */
    errors: CspValidationError[];
    /** List of warnings */
    warnings: CspValidationWarning[];
    /** List of recommendations */
    recommendations: string[];
    /** Parsed directives */
    parsedDirectives: Record<string, CspSource[]>;
    /** The original CSP string */
    originalCsp?: string;
    /** Metadata about the validation */
    meta?: {
        /** CSP level detected */
        cspLevel?: '1' | '2' | '3';
        /** Whether the CSP uses strict-dynamic */
        usesStrictDynamic?: boolean;
        /** Whether the CSP uses nonces or hashes */
        usesNoncesOrHashes?: boolean;
        /** List of directives that allow unsafe-inline */
        allowsUnsafeInline?: string[];
        /** List of directives that allow unsafe-eval */
        allowsUnsafeEval?: string[];
    };
}
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
//# sourceMappingURL=ipc.d.ts.map