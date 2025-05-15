# Changelog

All notable changes to FortiCode will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release of FortiCode
- Comprehensive CSP validation capabilities
- Developer documentation and contribution guidelines
- Performance optimization guide
- Troubleshooting and support resources

## [0.1.0] - 2025-05-14

### Added
- Initial project setup with Electron and React
- Basic CSP validation functionality
- Development environment configuration
- Documentation structure

## Upgrade Instructions

### Upgrading to v0.1.0

This is the initial release. No upgrade needed.

For new installations:

```bash
# Clone the repository
git clone https://github.com/ccsimenson/forticode.git
cd forticode

# Install dependencies
npm install

# Start the application
npm start
```

### Versioning Policy

FortiCode follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for added functionality in a backward-compatible manner
- **PATCH** version for backward-compatible bug fixes

### Deprecation Policy

- Deprecated features will be marked with `@deprecated` in the code and documentation
- Deprecated features will be supported for at least one minor version before removal
- Breaking changes will only be introduced in major versions

## Release Process

1. Update the version in `package.json`
2. Update this CHANGELOG.md with the new version and changes
3. Create a git tag for the version
4. Push the changes and tag to the repository
5. Create a GitHub release with the changelog entries

## Contributing to the Changelog

When adding entries to the changelog, please follow these guidelines:

1. Add entries under the appropriate section (Added, Changed, Deprecated, Removed, Fixed, Security)
2. Include a reference to the issue or pull request if applicable
3. Use the present tense (e.g., "Add feature" not "Added feature")
4. Include relevant details about the change
5. Keep descriptions concise but informative

Example:

```markdown
## [1.0.0] - 2025-01-01

### Added
- New feature that does something useful (#123)

### Changed
- Improved performance of CSP validation (#124)


### Fixed
- Issue with parsing certain CSP directives (#125)
```

## Security Updates

Security-related changes will be clearly marked in the changelog. For critical security updates, please refer to the [Security Policy](SECURITY.md).

## License

This changelog is licensed under the [MIT License](LICENSE).
