# Project Structure

This document outlines the structure of the FortiCode project and the purpose of key directories and files.

## Directory Structure

```
forticode/
├── .github/               # GitHub configuration and workflows
│   └── workflows/          # GitHub Actions workflows
├── dist/                   # Production build output
├── docs/                   # Documentation
├── public/                 # Static assets
├── release/                # Packaged application builds
├── scripts/                # Build and utility scripts
├── src/
│   ├── main/              # Main process code
│   │   ├── index.ts        # Main process entry point
│   │   ├── preload.ts      # Preload script
│   │   └── ipc/            # IPC handlers
│   ├── renderer/           # Renderer process code (React)
│   │   ├── App.tsx        # Main application component
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # State management
│   │   └── styles/         # Global styles
│   └── shared/             # Code shared between main and renderer
│       └── ipc.ts          # IPC type definitions
├── test/                   # Test files
├── .editorconfig           # Editor configuration
├── .eslintrc.js            # ESLint configuration
├── .gitignore
├── electron.vite.config.ts # Electron-Vite configuration
├── package.json
├── README.md
└── tsconfig.json           # TypeScript configuration
```

## Key Files

### Main Process (`src/main/`)

- `index.ts`: The main process entry point. Handles app lifecycle and window management.
- `preload.ts`: Preload script that exposes Node.js APIs to the renderer process.
- `ipc/`: Contains IPC handlers for communication between main and renderer processes.

### Renderer Process (`src/renderer/`)

- `App.tsx`: The root React component.
- `components/`: Reusable React components.
- `hooks/`: Custom React hooks.
- `pages/`: Page components for different routes.
- `store/`: State management (e.g., Redux, Zustand, or similar).
- `styles/`: Global styles and themes.

### Shared Code (`src/shared/`)

- `ipc.ts`: TypeScript interfaces and types for IPC communication.
- `types/`: Shared TypeScript type definitions.

## Build and Configuration

- `electron.vite.config.ts`: Vite configuration for Electron.
- `tsconfig.json`: TypeScript configuration.
- `.eslintrc.js`: ESLint configuration.
- `.prettierrc`: Prettier configuration.

## Testing

- `test/`: Contains all test files.
  - `unit/`: Unit tests.
  - `integration/`: Integration tests.
  - `e2e/`: End-to-end tests.

## Documentation

- `docs/`: Project documentation.
  - `development/`: Developer guides.
  - `api/`: API documentation.
  - `guides/`: How-to guides.
  - `contributing/`: Contribution guidelines.

## Build and Release

- `dist/`: Output directory for production builds.
- `release/`: Packaged application builds.
- `scripts/`: Build and utility scripts.

## Development Workflow

1. **Development**: Run `npm run dev` to start the development server.
2. **Testing**: Run `npm test` to execute tests.
3. **Building**: Run `npm run build` to create a production build.
4. **Packaging**: Run `npm run package` to package the application.

## Dependencies

- **Main Dependencies**:
  - Electron: For building cross-platform desktop apps.
  - React: For building the user interface.
  - TypeScript: For type safety.
  - Vite: For fast development and building.

- **Development Dependencies**:
  - ESLint: For code linting.
  - Prettier: For code formatting.
  - Jest: For testing.
  - Testing Library: For React component testing.
