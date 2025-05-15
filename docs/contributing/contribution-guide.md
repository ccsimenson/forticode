# Contribution Guide

Thank you for your interest in contributing to FortiCode! We welcome contributions from the community to help improve this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](code-of-conduct.md). Please read it before contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/forticode.git
   cd forticode
   ```
3. **Set up the development environment**
   ```bash
   npm install
   ```
4. **Create a branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

## Development Workflow

1. **Start the development server**
   ```bash
   npm run dev
   ```
2. **Make your changes** following the [code style](#code-style)
3. **Write tests** for your changes
4. **Run tests** to ensure everything works
   ```bash
   npm test
   ```
5. **Lint your code**
   ```bash
   npm run lint
   ```
6. **Commit your changes** with a descriptive commit message
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin your-branch-name
   ```
8. **Open a Pull Request** from your fork to the main repository

## Code Style

- Follow the [TypeScript Coding Standards](../development/coding-standards.md)
- Use Prettier for code formatting
- Use ESLint for code linting
- Write meaningful commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(validator): add support for CSP Level 3

Add validation for new CSP Level 3 directives including 'worker-src' and 'navigate-to'.

Closes #123
```

## Testing

- Write unit tests for new features and bug fixes
- Ensure all tests pass before submitting a pull request
- Update tests when fixing bugs or changing functionality
- Follow the [testing guidelines](../guides/testing.md)

## Pull Requests

1. **Keep PRs focused** - Each PR should address a single issue or feature
2. **Reference issues** - Include the issue number in your PR description (e.g., `Fixes #123`)
3. **Update documentation** - Ensure all relevant documentation is updated
4. **Add tests** - Include tests for new features or bug fixes
5. **Keep the diff small** - Break large changes into smaller, more manageable PRs
6. **Request reviews** - Request reviews from maintainers

### PR Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR

## Reporting Issues

Before reporting an issue:

1. Check if the issue has already been reported
2. Try to reproduce the issue with the latest version
3. Provide detailed information:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, Node.js version, etc.)
   - Screenshots or error messages if applicable

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Explain why this feature would be valuable
3. Provide examples of how it would be used
4. Consider contributing the feature yourself if possible

## Documentation

Good documentation is crucial for the success of the project. Please help by:

1. Keeping documentation up to date
2. Adding documentation for new features
3. Fixing typos and inaccuracies
4. Improving existing documentation

## Community

- Join our [Discord/Slack channel]()
- Follow us on [Twitter]()
- Read our [blog]()

## License

By contributing to FortiCode, you agree that your contributions will be licensed under its [MIT License](../LICENSE).

## Thank You!

Your contributions help make FortiCode better for everyone. Thank you for your time and effort!
