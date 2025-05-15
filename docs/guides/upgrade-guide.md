# Upgrade Guide

This guide provides instructions for upgrading between different versions of FortiCode, including breaking changes and migration steps.

## Table of Contents

- [Upgrade Policy](#upgrade-policy)
- [Version Compatibility](#version-compatibility)
- [Upgrade Instructions](#upgrade-instructions)
  - [From v0.1.0 to vNext](#from-v010-to-vnext)
- [Handling Breaking Changes](#handling-breaking-changes)
- [Troubleshooting Upgrades](#troubleshooting-upgrades)
- [Getting Help](#getting-help)

## Upgrade Policy

FortiCode follows these versioning principles:

- **Patch releases** (0.0.x): Backward-compatible bug fixes only
- **Minor releases** (0.x.0): New features and improvements, backward-compatible
- **Major releases** (x.0.0): May contain breaking changes

We recommend always running the latest patch version of your current minor version.

## Version Compatibility

| FortiCode Version | Node.js | Electron | React |
|-------------------|--------|----------|--------|
| 0.1.x            | 18.x   | ^25.0.0  | ^18.2.0 |

## Upgrade Instructions

### From v0.1.0 to vNext

#### Prerequisites
- Node.js 18.x or later
- npm 8.x or later

#### Steps

1. **Backup your project**
   ```bash
   cp -r your-project your-project-backup
   ```

2. **Update package.json**
   Update the FortiCode version in your `package.json`:
   ```json
   {
     "dependencies": {
       "forticode": "^0.1.0"
     }
   }
   ```

3. **Update dependencies**
   ```bash
   npm install
   ```

4. **Review breaking changes**
   Check the [CHANGELOG.md](../CHANGELOG.md) for any breaking changes that might affect your application.

5. **Test your application**
   Run your test suite and manually test critical functionality.

## Handling Breaking Changes

### API Changes

If you encounter API-related breaking changes:

1. Check the migration guide in the release notes
2. Update your code to use the new APIs
3. Look for `@deprecated` warnings in your IDE
4. Run tests to ensure compatibility

### Configuration Changes

If configuration options have changed:

1. Compare your current configuration with the new defaults
2. Update your configuration files accordingly
3. Test with the new configuration in a development environment

## Troubleshooting Upgrades

### Common Issues

#### Dependency Conflicts

If you encounter dependency conflicts:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### Type Errors

If you see TypeScript errors after upgrading:

1. Update your TypeScript version if needed
2. Check for type definition changes in the new version
3. Update your type definitions accordingly

## Getting Help

If you encounter issues during the upgrade:

1. Check the [Troubleshooting Guide](../troubleshooting.md)
2. Search the [GitHub Issues](https://github.com/ccsimenson/forticode/issues)
3. Ask for help in [GitHub Discussions](https://github.com/ccsimenson/forticode/discussions)

## Version-Specific Notes

### v0.1.0

- Initial release
- Basic CSP validation functionality
- Developer documentation
- Performance optimization guide

## Future Upgrades

For future versions, check the [ROADMAP.md](../ROADMAP.md) for planned features and changes that might affect upgrades.
