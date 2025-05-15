import { CspValidationError, CspValidationWarning } from '../../shared/ipc.js';

export type CspFixType = 'add' | 'remove' | 'modify' | 'replace';

export interface CspFix {
  /** Description of what the fix does */
  description: string;
  /** The actual fix to apply */
  fix: string;
  /** Type of fix */
  type: CspFixType;
  /** The directive this fix applies to */
  directive?: string;
  /** The value to use for the fix */
  value?: string;
}

export interface CspFixSuggestion {
  /** The issue this suggestion addresses */
  issue: string;
  /** List of possible fixes */
  fixes: CspFix[];
  /** Severity of the issue */
  severity: 'low' | 'medium' | 'high';
  /** The original error this suggestion is for */
  originalError?: CspValidationError;
}

export interface CspValidationResponseWithFixes {
  /** Whether the CSP is valid */
  isValid: boolean;
  /** List of errors */
  errors: CspValidationError[];
  /** List of warnings */
  warnings: CspValidationWarning[];
  /** List of recommendations */
  recommendations: string[];
  /** List of fix suggestions */
  fixSuggestions?: CspFixSuggestion[];
  /** Parsed directives */
  parsedDirectives: Record<string, any>;
  /** The original CSP string */
  originalCsp?: string;
  /** Metadata about the validation */
  meta?: {
    cspLevel: string;
    usesStrictDynamic: boolean;
    usesNoncesOrHashes: boolean;
    allowsUnsafeInline: string[];
    allowsUnsafeEval: string[];
    recommendations: string[];
    directives: Record<string, any>;
  };
  /** Fixes to be applied */
  fixes: CspFixSuggestion[];
}
