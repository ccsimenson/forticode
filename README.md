# Electron Security Auditor

A comprehensive security auditing tool for Electron.js and Node.js applications, designed to help developers identify and fix security vulnerabilities in their applications.

## Features

- **CSP Validation**: Detect misconfigurations and inline script violations in Content Security Policies
- **Dynamic Nonce Generation**: Generate and apply secure nonces for scripts and styles
- **Dependency Auditing**: Scan for known vulnerabilities in npm dependencies
- **GitHub Integration**: Connect with GitHub repositories for automated security scanning
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Modern UI**: Built with React and Material-UI for a polished user experience

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 8.x or later
- Git (for version control)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/electron-security-auditor.git
   cd electron-security-auditor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the application in development mode:

```bash
npm run dev
```

This will start the Electron application with hot-reloading enabled.

### Building for Production

To create a production build:

```bash
# Build the application
npm run build

# Package the application for the current platform
npm run package

# Create platform-specific installers
npm run dist
```

## Usage

1. **CSP Validation**:
   - Paste your Content Security Policy in the editor
   - Click "Validate CSP" to check for issues
   - Review the validation results and suggested fixes

2. **Generate Secure CSP**:
   - Click "Generate Secure CSP" to create a secure baseline CSP
   - Customize the generated policy as needed

3. **Dependency Auditing**:
   - Navigate to the "Dependencies" tab
   - Click "Scan Dependencies" to check for known vulnerabilities

4. **GitHub Integration**:
   - Connect your GitHub account
   - Select a repository to scan for security issues
   - View and fix issues directly in the application

## Architecture

The application follows a modular architecture with the following main components:

- **Main Process**: Handles window management, file system operations, and inter-process communication
- **Renderer Process**: Manages the React-based UI and user interactions
- **Modules**:
  - CSP Validator: Validates and generates Content Security Policies
  - Security Scanner: Scans for security vulnerabilities
  - Dependency Checker: Audits npm dependencies for known vulnerabilities
  - GitHub Integration: Connects with GitHub for repository scanning

## Security Considerations

- The application implements strict Content Security Policies
- Sensitive operations are performed in the main process
- All user data is stored locally and encrypted when necessary
- Regular security audits are performed to identify and fix vulnerabilities

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers directly.

## Roadmap

See our [ROADMAP.md](ROADMAP.md) for planned features and future development.
