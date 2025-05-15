# Coding Standards

This document outlines the coding standards and best practices for the FortiCode project.

## General Guidelines

- Write clear, maintainable, and self-documenting code
- Follow the principle of least privilege
- Keep functions and components small and focused
- Avoid code duplication (DRY principle)
- Write meaningful comments for complex logic
- Keep the codebase tidy and organized

## TypeScript

- Use TypeScript for all new code
- Enable strict mode in TypeScript
- Use explicit return types for functions
- Prefer interfaces over types for public API definitions
- Use `readonly` for immutable properties
- Use `const` assertions for literal types

### Type Naming Conventions

- Use `PascalCase` for type and interface names
- Use `I` prefix for interfaces (e.g., `IUser`)
- Use `T` prefix for generic type parameters (e.g., `TResult`)

### Example

```typescript
interface IUser {
  readonly id: string;
  name: string;
  email: string;
}

function getUser<T extends { id: string }>(id: string): Promise<T> {
  // Implementation
}
```

## JavaScript

- Use modern JavaScript (ES2020+)
- Prefer `const` and `let` over `var`
- Use template literals for string interpolation
- Use object destructuring
- Use array methods (map, filter, reduce) over loops when appropriate

## React

### Component Structure

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for component props
- Destructure props at the top of the component
- Use React.memo for performance optimization when necessary

### Hooks

- Name custom hooks with `use` prefix (e.g., `useAuth`)
- Call hooks at the top level of your component
- Follow the rules of hooks (don't call hooks conditionally)
- Extract complex logic into custom hooks

### Example

```tsx
interface IUserProfileProps {
  userId: string;
  onUpdate: (user: IUser) => void;
}

const UserProfile: React.FC<IUserProfileProps> = ({ userId, onUpdate }) => {
  const { user, loading, error } = useUser(userId);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error.message} />;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default React.memo(UserProfile);
```

## Styling

- Use CSS Modules for component-scoped styles
- Follow BEM naming convention for CSS classes
- Use CSS variables for theming
- Keep styles close to components
- Prefer flexbox and grid for layouts

## Error Handling

- Use try/catch blocks for async operations
- Create custom error classes for different error types
- Log errors appropriately
- Provide meaningful error messages to users
- Handle edge cases gracefully

### Example

```typescript
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

async function validateUser(input: IUserInput): Promise<void> {
  if (!input.email) {
    throw new ValidationError('Email is required', 'email');
  }
  
  if (!isValidEmail(input.email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
}
```

## Testing

- Write unit tests for utility functions and custom hooks
- Write integration tests for components
- Use React Testing Library for component testing
- Mock external dependencies in tests
- Follow the AAA pattern (Arrange, Act, Assert)

### Example

```typescript
describe('UserProfile', () => {
  it('displays user data when loaded', async () => {
    // Arrange
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    jest.spyOn(api, 'fetchUser').mockResolvedValue(mockUser);
    
    // Act
    render(<UserProfile userId="1" />);
    
    // Assert
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

## Documentation

- Document public APIs with JSDoc comments
- Document complex business logic
- Keep README files up to date
- Document environment variables and configuration
- Update CHANGELOG.md for each release

### Example

```typescript
/**
 * Fetches a user by ID
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise<IUser>} A promise that resolves to the user data
 * @throws {ValidationError} If the user ID is invalid
 * @throws {NotFoundError} If the user is not found
 */
async function getUser(userId: string): Promise<IUser> {
  // Implementation
}
```

## Git Workflow

- Create feature branches from `main`
- Use descriptive branch names (e.g., `feature/add-user-auth`)
- Write clear, concise commit messages
- Reference issues in commit messages (e.g., `Fix #123: Fix login bug`)
- Rebase your branch before creating a pull request
- Keep pull requests focused and small

## Code Review

- Be respectful and constructive in code reviews
- Focus on code quality and maintainability
- Check for security vulnerabilities
- Ensure tests are included for new features
- Verify documentation is updated
