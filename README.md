# Kanban Task Manager

A web-based Kanban board for managing tasks. You can create boards, add columns, and drag tasks between them.

## What this project is about

This project started as a Kanban task manager and was then refactored to add a proper testing setup. The main focus was learning how to write tests for React applications - including unit tests for reducers, tests for the Zustand store, and component tests with mocked dependencies.

The testing stack uses Vitest as the test runner, React Testing Library for rendering components, and MSW (Mock Service Worker) for mocking API calls.

## Running the app

```bash
yarn        # install dependencies
yarn dev    # start the dev server
```

## Running tests

```bash
yarn test          # run tests in watch mode
yarn test:run      # run tests once
yarn test:coverage # run tests with coverage report
```

## Project structure

- `src/components/` - React components (board, layout, modals, ui)
- `src/hooks/` - Custom hooks
- `src/pages/` - Page components
- `src/store/` - Zustand store
- `src/test/` - Test setup, mocks, and grouped tests (`unit/`, `integration/`)
- `src/utils/` - Reducer and helper functions
- `docs/` - Documentation on various topics

## Documentation

The `docs/` folder contains notes on different aspects of the project:

- `TESTING.md` - Guide on testing React applications
- `GLOBAL-STORE-IMPLEMENTATION.md` - How the Zustand store is set up
- `REFACTORING-CHANGES.md` - Changes made to improve the codebase
- `SETUP-GUIDE.md` - Project setup notes
