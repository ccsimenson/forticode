# CSP Validator API

The CSP (Content Security Policy) Validator is a core component of FortiCode that validates and analyzes Content Security Policies for security best practices.

## Overview

The `CspValidator` class provides methods to validate CSP strings against security best practices. It includes caching, optimized parsing, and lazy loading of validation rules for better performance.

## API Reference

### `CspValidator` Class

#### Static Methods

##### `getInstance(): CspValidator`

Returns the singleton instance of the CSP Validator.

```typescript
const validator = CspValidator.getInstance();
```

#### Instance Methods

##### `validateCsp(csp: string, options?: CspValidationOptions): CspValidationResponse`

Validates a CSP string against security best practices.

**Parameters:**
- `csp`: The Content Security Policy string to validate
- `options`: Optional configuration object
  - `filePath`: Optional file path for source mapping
  - `strict`: If true, bypasses cache (default: false)

**Returns:** `CspValidationResponse`

**Example:**
```typescript
const result = validator.validateCsp("script-src 'self'; object-src 'none'");
console.log(result.isValid); // true
```

##### `clearCache(): void`

Clears the validation cache. Useful when memory usage needs to be managed.

```typescript
validator.clearCache();
```

### Types

#### `CspValidationOptions`

```typescript
interface CspValidationOptions {
  filePath?: string;     // Optional file path for source mapping
  strict?: boolean;      // If true, bypasses cache
}
```

#### `CspValidationResponse`

```typescript
interface CspValidationResponse {
  isValid: boolean;                    // Whether the CSP is valid
  errors: CspValidationError[];         // Array of validation errors
  warnings: CspValidationWarning[];     // Array of validation warnings
  recommendations: string[];           // Security recommendations
  parsedDirectives: Record<string, string[]>;  // Parsed CSP directives
  meta: CspValidationMeta;             // Validation metadata
}
```

#### `CspValidationError`

```typescript
interface CspValidationError {
  directive: string;                   // The directive that caused the error
  message: string;                     // Error message
  severity: ValidationSeverity.ERROR;  // Always ValidationSeverity.ERROR
  errorCode: ErrorCode;                // Error code
  suggestion?: string;                 // Suggested fix
  line?: number;                       // Line number (if applicable)
  column?: number;                     // Column number (if applicable)
  context?: Record<string, unknown>;   // Additional context
}
```

#### `CspValidationWarning`

```typescript
interface CspValidationWarning {
  directive: string;                   // The directive that caused the warning
  message: string;                     // Warning message
  severity: ValidationSeverity.WARNING; // Always ValidationSeverity.WARNING
  warningCode: WarningCode;            // Warning code
  suggestion?: string;                 // Suggested improvement
  line?: number;                       // Line number (if applicable)
  column?: number;                     // Column number (if applicable)
  context?: Record<string, unknown>;   // Additional context
}
```

#### `CspValidationMeta`

```typescript
interface CspValidationMeta {
  cspLevel: CspLevel;                  // The CSP level detected ('1', '2', or '3')
  usesStrictDynamic: boolean;          // Whether 'strict-dynamic' is used
  usesNoncesOrHashes: boolean;          // Whether nonces or hashes are used
  allowsUnsafeInline: string[];         // Directives that allow 'unsafe-inline'
  allowsUnsafeEval: string[];          // Directives that allow 'unsafe-eval'
}
```

### Error and Warning Codes

#### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CSP_STRING` | The provided CSP string is invalid or empty |
| `INVALID_NONCE` | Invalid nonce value in CSP |
| `INVALID_HASH` | Invalid hash value in CSP |
| `MIXED_CONTENT` | Mixed content (HTTP/HTTPS) detected |
| `VALIDATION_ERROR` | General validation error |

#### Warning Codes

| Code | Description |
|------|-------------|
| `MISSING_DEFAULT_SRC` | Missing default-src directive |
| `UNSAFE_INLINE` | Unsafe inline scripts/styles detected |
| `UNSAFE_EVAL` | Unsafe eval usage detected |
| `WILDCARD_SOURCE` | Wildcard source detected |
| `MISSING_OBJECT_SRC` | Missing object-src directive |
| `MISSING_BASE_URI` | Missing base-uri directive |
| `MISSING_FORM_ACTION` | Missing form-action directive |
| `MISSING_FRAME_ANCESTORS` | Missing frame-ancestors directive |
| `MISSING_REPORT_TO` | Missing report-to directive |
| `MISSING_REPORT_URI` | Missing report-uri directive |
| `DEPRECATED_REPORT_URI` | Deprecated report-uri directive used |
| `MISSING_TRUSTED_TYPES` | Missing trusted-types directive |

## Usage Examples

### Basic Validation

```typescript
const validator = CspValidator.getInstance();
const csp = "script-src 'self'; object-src 'none';";
const result = validator.validateCsp(csp);

if (result.isValid) {
  console.log('CSP is valid!');
} else {
  console.error('CSP validation failed:', result.errors);
}

// Output recommendations
if (result.recommendations.length > 0) {
  console.log('Recommendations:');
  result.recommendations.forEach(rec => console.log(`- ${rec}`));
}
```

### Handling Validation Results

```typescript
const validator = CspValidator.getInstance();
const result = validator.validateCsp("script-src *; object-src *");

// Process errors
result.errors.forEach(error => {
  console.error(`[${error.errorCode}] ${error.message}`);
  if (error.suggestion) {
    console.log(`  Suggestion: ${error.suggestion}`);
  }
});

// Process warnings
result.warnings.forEach(warning => {
  console.warn(`[${warning.warningCode}] ${warning.message}`);
  if (warning.suggestion) {
    console.log(`  Suggestion: ${warning.suggestion}`);
  }
});
```

### Caching

The validator caches parsed CSPs and validation results by default. You can control this behavior:

```typescript
// Bypass cache
const result = validator.validateCsp("script-src 'self'", { strict: true });

// Clear the entire cache
validator.clearCache();
```

## Best Practices

1. **Always validate CSPs** before deploying to production
2. **Use the latest CSP level** (currently CSP Level 3)
3. **Avoid 'unsafe-inline'** - use nonces or hashes instead
4. **Set a strong default-src** as a fallback
5. **Use 'strict-dynamic'** for modern browsers
6. **Enable reporting** with report-uri or report-to
7. **Test your CSP** in different browsers

## Performance Considerations

- The validator uses caching to improve performance for repeated validations
- Parsing is optimized for performance
- Validation rules are loaded lazily
- For large-scale validation, consider using the `strict` option to bypass cache when needed

## Troubleshooting

### Common Issues

1. **Invalid CSP Format**
   - Ensure the CSP string follows the correct format
   - Check for missing semicolons between directives

2. **Cache Issues**
   - If you suspect caching issues, use `{ strict: true }` or call `clearCache()`

3. **Performance Problems**
   - For large CSPs, consider breaking them into smaller policies
   - Use the `strict` option to disable caching if memory usage is a concern

## See Also

- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [Google's CSP Evaluator](https://csp-evaluator.withgoogle.com/)
