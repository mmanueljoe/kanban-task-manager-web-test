# Testing in React: A First Principles Guide

This document explains testing in React from the ground up. By the end, you'll understand not just _how_ to write tests, but _why_ we write them the way we do.

---

## Table of Contents

1. [Why Test?](#why-test)
2. [The Testing Mindset](#the-testing-mindset)
3. [Types of Tests](#types-of-tests)
4. [The Testing Stack](#the-testing-stack)
5. [Project Structure](#project-structure)
6. [Writing Your First Test](#writing-your-first-test)
7. [Testing Pure Functions (Reducers)](#testing-pure-functions-reducers)
8. [Testing State Management (Zustand Store)](#testing-state-management-zustand-store)
9. [Testing Components](#testing-components)
10. [Mocking: The Art of Isolation](#mocking-the-art-of-isolation)
11. [The Hoisting Problem](#the-hoisting-problem)
12. [Common Patterns](#common-patterns)
13. [Debugging Failed Tests](#debugging-failed-tests)
14. [Transferable Knowledge](#transferable-knowledge)

---

## Why Test?

Testing answers one question: **Does my code do what I think it does?**

Without tests, you rely on:

- Manual clicking through the app
- Hope that you didn't break something
- Users reporting bugs

With tests, you get:

- Instant feedback when something breaks
- Confidence to refactor code
- Documentation of how code should behave
- Protection against regressions

**The key insight**: Tests are not about proving code works. They're about catching when it _stops_ working.

---

## The Testing Mindset

Before writing any test, ask yourself:

1. **What behavior am I testing?** Not implementation details, but actual outcomes.
2. **What would a user see?** Test from the user's perspective.
3. **What could go wrong?** Edge cases, error states, empty states.

**Bad test thinking**: "I need to test that `useState` was called"
**Good test thinking**: "I need to test that clicking the button shows a success message"

---

## Types of Tests

### Unit Tests

Test a single function or module in isolation.

- Fast to run
- Easy to write
- Test edge cases thoroughly

**Example**: Testing a reducer function

### Integration Tests

Test how multiple parts work together.

- More realistic
- Catch bugs that unit tests miss
- Slower than unit tests

**Example**: Testing a component that uses hooks and renders children

### End-to-End (E2E) Tests

Test the entire application like a real user.

- Most realistic
- Slowest to run
- Most brittle (can break from unrelated changes)

**Example**: Testing the full flow of creating a task (not covered in this project)

---

## The Testing Stack

This project uses four main tools:

### 1. Vitest (Test Runner)

Vitest runs your tests and reports results. Think of it as the "engine" that executes your test code.

```typescript
import { describe, it, expect } from 'vitest';

describe('math', () => {
  it('adds numbers', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- `describe`: Groups related tests together
- `it`: Defines a single test case
- `expect`: Makes assertions about values

### 2. React Testing Library (RTL)

RTL renders React components and provides ways to interact with them.

**Philosophy**: Test components the way users interact with them.

```typescript
import { render, screen } from '@testing-library/react';

render(<Button>Click me</Button>);
screen.getByText('Click me'); // Find by visible text
screen.getByRole('button');   // Find by accessibility role
```

### 3. userEvent

Simulates real user interactions (clicks, typing, etc.).

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(button); // Click
await user.type(input, 'hi'); // Type text
```

### 4. MSW (Mock Service Worker)

Intercepts network requests and returns fake responses.

```typescript
import { http, HttpResponse } from 'msw';

http.get('/api/boards', () => {
  return HttpResponse.json([{ name: 'My Board' }]);
});
```

---

## Project Structure

```
src/test/
  ├── setup.ts              # Global test configuration
  ├── mocks/
  │   ├── handlers.ts       # API mock definitions
  │   └── server.ts         # MSW server setup
  ├── boardsReducer.test.ts # Pure function tests
  ├── useStore.test.ts      # Store tests
  ├── BoardView.test.tsx    # Component tests
  └── TaskDetailsModal.test.tsx
```

### Configuration Files

**vitest.config.ts** - Tells Vitest how to run tests:

```typescript
export default defineConfig({
  test: {
    globals: true, // No need to import describe/it/expect
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/test/setup.ts', // Run before tests
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // ... other aliases
    },
  },
});
```

**setup.ts** - Runs before every test file:

```typescript
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from './mocks/server';

// Add custom matchers like toBeInTheDocument()
expect.extend(matchers);

// Clean up DOM after each test
afterEach(() => cleanup());

// Start/stop mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Writing Your First Test

Let's break down a simple test:

```typescript
import { describe, it, expect } from 'vitest';

describe('Calculator', () => {
  it('adds two numbers', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });
});
```

**Line by line:**

1. Import test utilities
2. `describe` creates a test group named "Calculator"
3. `it` defines a test case (what we're testing)
4. Call the function we're testing
5. `expect` asserts the result equals 5

---

## Testing Pure Functions (Reducers)

Pure functions are the easiest to test because:

- Same input always gives same output
- No side effects
- No dependencies to mock

### Example: boardsReducer.test.ts

```typescript
import { boardsReducer } from '@/utils/boardsReducer';

// Define starting state
const initialState = { boards: [] };

describe('boardsReducer', () => {
  it('handles ADD_BOARD', () => {
    // 1. Arrange: Set up input
    const action = {
      type: 'ADD_BOARD',
      payload: { name: 'New Board', columns: [] },
    };

    // 2. Act: Call the function
    const newState = boardsReducer(initialState, action);

    // 3. Assert: Check the output
    expect(newState.boards).toEqual([{ name: 'New Board', columns: [] }]);
  });
});
```

**Pattern: Arrange-Act-Assert (AAA)**

1. **Arrange**: Set up test data
2. **Act**: Perform the action
3. **Assert**: Check the result

### Testing Edge Cases

```typescript
it('returns unchanged state for unknown action', () => {
  const action = { type: 'UNKNOWN' };
  const result = boardsReducer(initialState, action);
  expect(result).toEqual(initialState);
});

it('handles empty column name', () => {
  const action = {
    type: 'ADD_COLUMN',
    payload: { boardIndex: 0, columnName: '' },
  };
  const result = boardsReducer(stateWithBoard, action);
  // Should not add empty column
  expect(result.boards[0].columns).toHaveLength(0);
});
```

---

## Testing State Management (Zustand Store)

Zustand stores are global singletons, which creates a challenge: state persists between tests.

### The Problem

```typescript
// Test 1: Adds a board
store.dispatch({ type: 'ADD_BOARD', payload: board });
// State: { boards: [board] }

// Test 2: Expects empty state (FAILS!)
expect(store.boards).toEqual([]); // Still has board from Test 1!
```

### The Solution: Reset State Between Tests

```typescript
const getInitialState = () => ({
  boards: [],
  theme: 'light',
  user: null,
  // ...
});

beforeEach(() => {
  // Reset data but keep the action functions
  const state = useStore.getState();
  useStore.setState(
    {
      ...getInitialState(),
      dispatch: state.dispatch,
      setTheme: state.setTheme,
      // ... keep all functions
    },
    true // Replace entire state
  );
});
```

### Mocking Store Dependencies

The store reads from localStorage on initialization. We need to mock this:

```typescript
// Create mock functions
const mockGetTheme = vi.fn(() => 'light');
const mockSetTheme = vi.fn();

// Tell Vitest to use our mocks instead of real module
vi.mock('@/utils/localStorage', () => ({
  getTheme: mockGetTheme,
  setTheme: mockSetTheme,
}));
```

### Testing Store Actions

```typescript
it('sets theme and persists it', () => {
  const { setTheme } = useStore.getState();

  act(() => {
    setTheme('dark');
  });

  const state = useStore.getState();
  expect(state.theme).toBe('dark');
  expect(mockSetTheme).toHaveBeenCalledWith('dark');
});
```

**Why `act()`?** React needs to know when state updates happen so it can batch them properly. `act()` tells React "something is about to change."

---

## Testing Components

Component tests verify that:

1. The right things appear on screen
2. User interactions trigger correct behavior
3. Different states render correctly

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { TaskDetailsModal } from '@/components/modals/TaskDetailsModal';

it('renders task details', () => {
  render(
    <TaskDetailsModal
      open={true}
      boardIndex={0}
      columnName="Todo"
      taskTitle="Test Task"
      onClose={() => {}}
    />
  );

  expect(screen.getByText('Test Task')).toBeInTheDocument();
  expect(screen.getByText('Test description')).toBeInTheDocument();
});
```

### Testing User Interactions

```typescript
it('opens edit modal on edit button click', async () => {
  const user = userEvent.setup();
  render(<TaskDetailsModal {...props} />);

  // Click the menu button
  await user.click(screen.getByLabelText('More options'));

  // Click the edit button
  await user.click(screen.getByText('Edit Task'));

  // Verify modal appeared
  expect(screen.getByText('EditTaskModal')).toBeInTheDocument();
});
```

**Why `async/await`?** User interactions are asynchronous. The browser needs time to process clicks and update the DOM.

### Testing Different States

```typescript
it('shows empty board message when no columns', () => {
  mockUseCurrentBoard.mockReturnValue({
    board: { name: 'Empty Board', columns: [] },
    boardIndex: 0,
  });

  render(<BoardView />);

  expect(
    screen.getByText('This board is empty. Create a new column to get started.')
  ).toBeInTheDocument();
});

it('shows board not found when no board', () => {
  mockUseCurrentBoard.mockReturnValue({
    board: null,
    boardIndex: null,
  });

  render(<BoardView />);

  expect(screen.getByText('Board not found')).toBeInTheDocument();
});
```

---

## Mocking: The Art of Isolation

**Mocking** means replacing real code with fake versions you control.

### Why Mock?

1. **Isolation**: Test one thing at a time
2. **Speed**: Avoid slow operations (network, disk)
3. **Control**: Force specific scenarios (errors, edge cases)
4. **Determinism**: Same result every time

### What to Mock

| Mock This          | Don't Mock This              |
| ------------------ | ---------------------------- |
| API calls          | The component you're testing |
| localStorage       | React itself                 |
| External libraries | Simple utility functions     |
| Sibling components | The reducer (in store tests) |

### Mocking Modules

```typescript
// Replace an entire module
vi.mock('@/hooks/useBoards', () => ({
  useBoards: () => ({
    boards: [mockBoard],
    dispatch: vi.fn(),
  }),
}));
```

### Mocking Functions

```typescript
// Create a spy function
const mockDispatch = vi.fn();

// Check it was called correctly
expect(mockDispatch).toHaveBeenCalledWith({
  type: 'DELETE_TASK',
  payload: { boardIndex: 0, columnName: 'Todo', taskTitle: 'Test Task' },
});
```

### Mocking Components

```typescript
// Replace complex child components with simple ones
vi.mock('@/components/modals/EditTaskModal', () => ({
  EditTaskModal: ({ open }) => (open ? <div>EditTaskModal</div> : null),
}));
```

---

## The Hoisting Problem

This is the most confusing part of testing in Vitest/Jest. Understanding it will save you hours of debugging.

### The Problem

```typescript
// This looks correct but FAILS:
const mockFn = vi.fn();

vi.mock('./myModule', () => ({
  myFunction: mockFn, // Error: mockFn is not defined!
}));
```

### Why It Happens

Vitest "hoists" `vi.mock()` calls to the TOP of the file, before any other code runs. So this:

```typescript
const mockFn = vi.fn();
vi.mock('./module', () => ({ fn: mockFn }));
```

Becomes this internally:

```typescript
vi.mock('./module', () => ({ fn: mockFn })); // Moved to top!
const mockFn = vi.fn(); // Too late - mock already ran
```

### The Solution: vi.hoisted()

```typescript
// vi.hoisted() also gets moved to the top, BEFORE vi.mock()
const { mockFn } = vi.hoisted(() => ({
  mockFn: vi.fn(),
}));

vi.mock('./myModule', () => ({
  myFunction: mockFn, // Now this works!
}));
```

### Real Example from This Project

```typescript
// 1. Create mocks using vi.hoisted (these get moved to the very top)
const { mockGetTheme, mockSetTheme, mockGetAuth, mockSetAuth } = vi.hoisted(
  () => ({
    mockGetTheme: vi.fn(() => 'light'),
    mockSetTheme: vi.fn(),
    mockGetAuth: vi.fn(() => ({ isLoggedIn: false, user: null })),
    mockSetAuth: vi.fn(),
  })
);

// 2. Use mocks in vi.mock (this also gets hoisted, but after vi.hoisted)
vi.mock('@/utils/localStorage', () => ({
  getTheme: mockGetTheme,
  setTheme: mockSetTheme,
  getAuth: mockGetAuth,
  setAuth: mockSetAuth,
}));

// 3. Import the module that uses localStorage (this runs AFTER mocks are set up)
import { useStore } from '@/store/useStore';
```

**The order after hoisting:**

1. `vi.hoisted()` - Creates mock functions
2. `vi.mock()` - Sets up module replacements
3. `import` statements - Load modules (they get the mocked versions)
4. Your test code - Runs with everything set up

---

## Common Patterns

### Pattern 1: Wrapper Components

Some components need context providers (Router, Theme, etc.):

```typescript
const renderWithRouter = (ui) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

it('renders link correctly', () => {
  renderWithRouter(<MyComponent />);
  expect(screen.getByRole('link')).toBeInTheDocument();
});
```

### Pattern 2: Default Props

```typescript
const defaultProps = {
  open: true,
  onClose: vi.fn(),
  boardIndex: 0,
  columnName: 'Todo',
  taskTitle: 'Test Task',
};

it('renders', () => {
  render(<TaskDetailsModal {...defaultProps} />);
});

it('handles missing task', () => {
  render(<TaskDetailsModal {...defaultProps} taskTitle="Nonexistent" />);
});
```

### Pattern 3: Reset Mocks Between Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks(); // Reset call history
  mockFn.mockReturnValue(defaultValue); // Reset return values
});
```

### Pattern 4: Testing What Renders vs. What Doesn't

```typescript
it('does not render if task not found', () => {
  const { container } = render(
    <TaskDetailsModal {...defaultProps} taskTitle="Nonexistent" />
  );
  expect(container.firstChild).toBeNull();
});
```

---

## Debugging Failed Tests

### 1. Read the Error Message

```
TestingLibraryElementError: Unable to find an element with the text: Todo
```

This tells you exactly what's wrong: the text "Todo" isn't on screen.

### 2. Use screen.debug()

```typescript
it('renders correctly', () => {
  render(<MyComponent />);
  screen.debug();  // Prints the entire DOM to console
});
```

### 3. Check What's Actually Rendered

The error output shows the actual DOM:

```html
<body>
  <div>
    <h1>Title</h1>
    <!-- Notice: no "Todo" here -->
  </div>
</body>
```

### 4. Common Causes

| Error                                 | Likely Cause                                     |
| ------------------------------------- | ------------------------------------------------ |
| "Unable to find element"              | Text doesn't exist, or is split across elements  |
| "not a function"                      | Mock not set up correctly, or import order wrong |
| "Cannot access before initialization" | Hoisting problem - use `vi.hoisted()`            |
| "Cannot destructure property"         | Missing context provider (Router, Theme, etc.)   |

---

## Transferable Knowledge

Everything you've learned here applies to other projects:

### 1. The Testing Philosophy

- Test behavior, not implementation
- Write tests from the user's perspective
- Use the AAA pattern (Arrange-Act-Assert)

### 2. The Tools Map

| Tool                  | Purpose                     | Alternatives               |
| --------------------- | --------------------------- | -------------------------- |
| Vitest                | Test runner                 | Jest                       |
| React Testing Library | Component testing           | Enzyme (deprecated)        |
| userEvent             | User interaction simulation | fireEvent (less realistic) |
| MSW                   | API mocking                 | axios-mock-adapter, nock   |

### 3. The Mental Model

When testing any code:

1. **Identify inputs**: What does this function/component receive?
2. **Identify outputs**: What should it produce/render?
3. **Identify side effects**: What external things does it change?
4. **Mock the boundaries**: Replace external dependencies with fakes
5. **Test the contract**: Verify inputs produce expected outputs

### 4. Files You'll Create in Any Project

```
project/
  ├── vitest.config.ts      # or jest.config.js
  ├── src/test/
  │   ├── setup.ts          # Global setup
  │   └── mocks/            # API mocks
  └── src/**/*.test.ts      # Tests next to source files (optional)
```

### 5. The Checklist for Writing Any Test

1. What am I testing? (one specific behavior)
2. What do I need to mock? (external dependencies)
3. What inputs do I need? (props, state, actions)
4. What output do I expect? (DOM elements, function calls)
5. How do I verify it? (assertions)

---

## Running Tests

```bash
# Run all tests in watch mode
yarn test

# Run tests once (CI mode)
yarn test --run

# Run with coverage report
yarn test --coverage

# Run specific file
yarn test src/test/useStore.test.ts

# Run tests matching pattern
yarn test --grep "adds board"
```

---

## Quick Reference

### Query Priority (RTL)

Use in this order (most accessible to least):

1. `getByRole` - Accessibility roles (button, link, heading)
2. `getByLabelText` - Form labels
3. `getByPlaceholderText` - Input placeholders
4. `getByText` - Visible text
5. `getByDisplayValue` - Input values
6. `getByTestId` - Last resort (data-testid attribute)

### Common Assertions

```typescript
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveTextContent('text');
expect(element).toBeDisabled();
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(1);
expect(value).toBe(expected); // Strict equality
expect(value).toEqual(expected); // Deep equality
expect(array).toContain(item);
expect(array).toHaveLength(3);
```

### Async Utilities

```typescript
// Wait for element to appear
await screen.findByText('Loaded');

// Wait for condition
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading'));
```

---

## Summary

Testing is a skill that improves with practice. Start with:

1. **Pure functions** - Easiest to test, instant feedback
2. **Simple components** - Build confidence with rendering tests
3. **Interactive components** - Add user event testing
4. **Complex components** - Master mocking and isolation

The goal isn't 100% coverage. The goal is confidence that your code works and will keep working as you make changes.

Happy testing!
