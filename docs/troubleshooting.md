# Troubleshooting Guide

This guide provides solutions to common issues you might encounter while using or developing FortiCode.

## Table of Contents

- [Common Issues](#common-issues)
  - [Installation Issues](#installation-issues)
  - [Build Issues](#build-issues)
  - [Runtime Errors](#runtime-errors)
  - [CSP Validation Issues](#csp-validation-issues)
- [Debugging Tips](#debugging-tips)
  - [Debugging in VS Code](#debugging-in-vs-code)
  - [Debugging Renderer Process](#debugging-renderer-process)
  - [Debugging Main Process](#debugging-main-process)
  - [Enabling Debug Logs](#enabling-debug-logs)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

## Common Issues

### Installation Issues

#### Node.js Version Mismatch
**Issue**: Errors during `npm install` related to Node.js version.
**Solution**:
- Ensure you're using Node.js 18.x or later
- Use `nvm` (Node Version Manager) to manage Node.js versions
- Run `node -v` to check your current version

#### Dependency Resolution Errors
**Issue**: `ERESOLVE` or other dependency errors during installation.
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Build Issues

#### Module Not Found
**Issue**: Errors about missing modules during build.
**Solution**:
```bash
# Install missing dependencies
npm install <missing-module>

# Or reinstall all dependencies
rm -rf node_modules
npm install
```

#### TypeScript Errors
**Issue**: TypeScript compilation errors.
**Solution**:
- Run type checking: `npm run type-check`
- Ensure all TypeScript dependencies are installed
- Check for type definition conflicts

### Runtime Errors

#### White Screen on Startup
**Issue**: App shows a white screen when starting.
**Solution**:
1. Open Developer Tools (Ctrl+Shift+I or Cmd+Option+I)
2. Check the Console tab for errors
3. Common causes:
   - Missing environment variables
   - Failed API calls
   - Uncaught exceptions

#### IPC Communication Issues
**Issue**: Communication between main and renderer processes fails.
**Solution**:
- Ensure proper type definitions in `src/shared/ipc.ts`
- Check that channels are registered in both processes
- Verify preload script is correctly configured in `vite.config.ts`

### CSP Validation Issues

#### Invalid CSP Format
**Issue**: CSP validation fails with format errors.
**Solution**:
- Check for missing semicolons between directives
- Ensure directive names are lowercase
- Verify source expressions are properly quoted

#### False Positives/Negatives
**Issue**: CSP validator reports incorrect issues.
**Solution**:
- Check the CSP specification for the specific directive
- Verify browser compatibility
- Report false positives as issues on GitHub

## Debugging Tips

### Debugging in VS Code

1. **Set Up Launch Configurations**
   - Open the Run and Debug view (Ctrl+Shift+D)
   - Select the appropriate configuration ("Main Process" or "Renderer Process")
   - Set breakpoints in your code
   - Press F5 to start debugging

2. **Debugging Renderer Process**
   - Use Chrome DevTools (Ctrl+Shift+I or Cmd+Option+I)
   - Set breakpoints in the Sources tab
   - Use the Console tab for runtime evaluation

3. **Debugging Main Process**
   - Use VS Code's debugger with the "Main Process" configuration
   - Add `debugger` statements in your code
   - Check the Debug Console for logs

4. **Debugging Preload Scripts**
   - Use the "Main Process" debug configuration
   - Set breakpoints in your preload script
   - Check for context isolation issues

### Enabling Debug Logs

Set these environment variables for additional logging:

```bash
# Enable Electron debug logging
export ELECTRON_ENABLE_LOGGING=true

# Enable Vite debug logging
export DEBUG=vite:*

# Run with debug logging
npm run dev
```

### Debugging CSP Issues

1. **Browser Console Warnings**
   - Check for CSP violation warnings in the console
   - Look for blocked resources

2. **Using report-uri/report-to**
   - Add a reporting endpoint to your CSP
   - Monitor reports for violations
   ```
   Content-Security-Policy: default-src 'self'; report-uri https://example.com/csp-report
   ```

3. **CSP Evaluator**
   - Use online tools like [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
   - Check for misconfigurations

## Performance Issues

### Slow Build Times
**Solution**:
- Use Vite's caching: `npm run build -- --force` to bypass cache
- Check for unnecessary dependencies
- Optimize TypeScript compilation

### High Memory Usage
**Solution**:
- Clear CSP validator cache: `validator.clearCache()`
- Use the `strict` option for one-time validations
- Profile memory usage with Chrome DevTools

## Getting Help

If you're still experiencing issues, here are several ways to get support:

### Documentation

- [API Documentation](api/csp-validator.md) - Detailed reference for all APIs
- [Development Guide](development/setup.md) - Setup and development instructions
- [Coding Standards](development/coding-standards.md) - Project coding guidelines
- [FAQ](faq.md) - Answers to frequently asked questions

### Community Support

1. **GitHub Discussions**
   - Join the conversation in our [GitHub Discussions](https://github.com/ccsimenson/forticode/discussions)
   - Ask questions and share knowledge with other users

2. **Stack Overflow**
   - Tag your question with `forticode` and `electron`
   - Follow the [Stack Overflow guidelines](https://stackoverflow.com/help/how-to-ask) for best results

3. **Chat**
   - Join our community on [Discord](https://discord.gg/example) (invite link needed)
   - Real-time chat with developers and other users

### Reporting Issues

Before submitting a new issue:

1. Search the [existing issues](https://github.com/ccsimenson/forticode/issues) to avoid duplicates
2. Check if your issue has been fixed in the latest version
3. Review the [issue template](.github/ISSUE_TEMPLATE/bug_report.md) for required information

When reporting an issue, please include:

- FortiCode version (`npm list forticode`)
- Node.js version (`node -v`)
- Operating system and version
- Steps to reproduce the issue
- Expected vs. actual behavior
- Any error messages or logs

### Professional Support

For enterprise support or consulting services, please contact us at [support@forticode.example.com](mailto:support@forticode.example.com).

## Additional Resources

- [Electron Debugging Guide](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process)
- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [TypeScript Debugging](https://code.visualstudio.com/docs/typescript/typescript-debugging)
