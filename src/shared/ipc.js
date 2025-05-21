"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationSeverity = exports.IpcChannels = void 0;
// Define all IPC channel names in one place for type safety
var IpcChannels;
(function (IpcChannels) {
    // Window controls
    IpcChannels["WINDOW_MINIMIZE"] = "window:minimize";
    IpcChannels["WINDOW_MAXIMIZE"] = "window:maximize";
    IpcChannels["WINDOW_CLOSE"] = "window:close";
    IpcChannels["WINDOW_IS_MAXIMIZED"] = "window:is-maximized";
    // File operations
    IpcChannels["FILE_OPEN"] = "file:open";
    IpcChannels["FILE_SAVE"] = "file:save";
    // CSP operations
    IpcChannels["CSP_VALIDATE"] = "csp:validate";
    IpcChannels["CSP_GENERATE"] = "csp:generate";
    IpcChannels["CSP_APPLY"] = "csp:apply";
    // Security scans
    IpcChannels["SECURITY_SCAN"] = "security:scan";
    IpcChannels["SECURITY_FIX"] = "security:fix";
    // GitHub integration
    IpcChannels["GITHUB_AUTHENTICATE"] = "github:authenticate";
    IpcChannels["GITHUB_SCAN_REPO"] = "github:scan-repo";
    IpcChannels["GITHUB_GET_REPOS"] = "github:get-repos";
    // Settings
    IpcChannels["SETTINGS_GET"] = "settings:get";
    IpcChannels["SETTINGS_UPDATE"] = "settings:update";
    // Updates
    IpcChannels["CHECK_FOR_UPDATES"] = "updates:check";
    IpcChannels["DOWNLOAD_UPDATE"] = "updates:download";
    IpcChannels["INSTALL_UPDATE"] = "updates:install";
})(IpcChannels || (exports.IpcChannels = IpcChannels = {}));
/** Severity levels for validation messages */
var ValidationSeverity;
(function (ValidationSeverity) {
    ValidationSeverity["INFO"] = "info";
    ValidationSeverity["WARNING"] = "warning";
    ValidationSeverity["ERROR"] = "error";
    ValidationSeverity["CRITICAL"] = "critical";
})(ValidationSeverity || (exports.ValidationSeverity = ValidationSeverity = {}));
//# sourceMappingURL=ipc.js.map