# Development Setup

This guide will help you set up your development environment for FortiCode.

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git
- A code editor (VS Code recommended)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ccsimenson/forticode.git
   cd forticode
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start both the main process and renderer process with hot-reload enabled.

## Development Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run package` - Package the application

## Recommended VS Code Extensions

- ESLint
- Prettier - Code formatter
- TypeScript Vue Plugin (Volar)
- EditorConfig for VS Code
- Jest Runner

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development

# Development
ELECTRON_DISABLE_SECURITY_WARNINGS=true

# API (if applicable)
API_BASE_URL=http://localhost:3000
```

## Debugging

### Main Process

1. In VS Code, go to the Run and Debug view (Ctrl+Shift+D)
2. Select "Main Process" from the dropdown
3. Press F5 to start debugging

### Renderer Process

1. Open Chrome/Edge and navigate to `chrome://inspect`
2. Click on "Open dedicated DevTools for Node"
3. The renderer process should appear in the list when the app is running

## Testing

Run the test suite with:

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

## Building for Production

To create a production build:

```bash
npm run build
```

This will create optimized builds in the `dist` directory.

## Packaging

Package the application for distribution:

```bash
npm run package
```

This will create platform-specific packages in the `release` directory.
