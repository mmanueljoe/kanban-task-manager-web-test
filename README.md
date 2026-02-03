# Kanban Task Management Web App

A Kanban-style task manager built with **React**, **TypeScript**, and **Vite** where **all shared state lives in a single Zustand store**. The project focuses on **global state architecture**, **drag-and-drop task movement**, **protected routing**, and **small but meaningful UX improvements**.

## What I implemented

### 1. Single global store with Zustand

- **Everything in one store**: Boards (columns + tasks), theme, auth, loading keys, and toasts all live in `useStore`, backed by the existing `boardsReducer`.
- **No more heavy providers**: React Context providers for boards, auth, and theme were removed; components now read from the store via hooks like `useBoards`, `useTheme`, `useAuth`, and `useUi`.
- **Persistence and hydration**: Boards are hydrated and persisted with a dedicated `StoreHydration` component and a selector-based subscription so only real board changes hit `localStorage`.
- **UI loading behavior kept clean**: A thin `UiProvider` keeps only refs/timers needed for “minimum 300ms” loading while the actual `loadingKeys` and `toasts` live in the store.

For a deeper walkthrough, see [`docs/GLOBAL-STORE-IMPLEMENTATION.md`](docs/GLOBAL-STORE-IMPLEMENTATION.md) and [`docs/ALL-STATE-AND-DRAG-AND-DROP.md`](docs/ALL-STATE-AND-DRAG-AND-DROP.md).

### 2. Real Kanban boards, creation flow, and drag-and-drop

- **Boards, columns, and tasks**: The app uses real Kanban data—boards contain columns, columns contain tasks—and all updates go through the central reducer and store.
- **Create/edit flows**: Modals for adding and editing boards, columns, and tasks (`AddBoardModal`, `EditBoardModal`, `AddColumnModal`, `AddTaskModal`, `EditTaskModal`, `TaskDetailsModal`) all dispatch actions into the global store.
- **New board creation**: A dedicated `AddBoardModal` powers “Create New Board” from both the sidebar and header; on submit it dispatches `ADD_BOARD` and navigates to the new board route.
- **Drag-and-drop tasks**: Using `@dnd-kit`, tasks are draggable and columns are droppable; dropping a task simply dispatches the existing `MOVE_TASK` action so the store remains the single source of truth.
- **Empty states that actually work**: The empty-board “+ Add New Column” CTA now opens the real column modal instead of being a dead button.

The DnD and “all state in the store” decisions are described in [`docs/ALL-STATE-AND-DRAG-AND-DROP.md`](docs/ALL-STATE-AND-DRAG-AND-DROP.md).

### 3. Routing and auth wired to the store

- **Central route config**: `RouteProvider` owns all routes and splits layout vs non-layout pages (dashboard/board/admin vs login/404).
- **Protected routes**: `ProtectedRoute` now relies on store-based auth (`useAuth`) to guard sensitive pages (like `/admin`) and redirect unauthenticated users to `/login`.
- **Robust bad-route handling**:
  - A catch-all `*` route renders a friendly 404.
  - `BoardView` validates the `boardId` route param and renders a “Board not found” state when the ID is invalid, with a clear way back.
- **Delete-board flow that respects routing**: Deleting a board updates the store and navigates back to the dashboard so the URL, state, and UI stay in sync.

Routing details live in [`docs/ROUTING-AND-STRUCTURE.md`](docs/ROUTING-AND-STRUCTURE.md).

### 4. Frontend UX and component improvements

- **Validation that doesn’t fight the user**: Add-task and add-column modals keep the dialog open and preserve form values on validation errors, while surfacing issues via toasts.
- **Reusable `ThemeToggle`**: A shared `ThemeToggle` component powers theme switching in both the header and sidebar, wired into the global theme slice.
- **Shared `useCurrentBoard` selector hook**: All “current board” consumers (layout, header, board view) use a single hook that translates the route param into `{ board, boardIndex }`, so changing how boards are addressed later is a one-file change.
- **Consistent loading and toast experience**: A global loading overlay and toast host read from the store’s UI slice, giving consistent feedback across routes and flows.

These changes are summarized in [`docs/FRONTEND-IMPROVEMENTS.md`](docs/FRONTEND-IMPROVEMENTS.md).

### 5. Tooling and project setup

- **Modern Vite + React + TS setup** using the latest Vite template.
- **ESLint (flat config) + Prettier + Husky + lint-staged**:
  - `yarn lint`, `yarn lint:fix`, and `yarn format` scripts.
  - A pre-commit hook that formats and lints staged files.
- **Type-safe store and reducers**: Shared types live in `src/types/types.ts` and are reused by the store, reducer, and components.

The setup decisions and troubleshooting notes are captured in [`docs/SETUP-GUIDE.md`](docs/SETUP-GUIDE.md).

## Tech stack

- **Framework**: React + TypeScript
- **State management**: Zustand (single global store + reducer)
- **Routing**: React Router
- **Drag-and-drop**: `@dnd-kit/core`
- **Build tool**: Vite
- **Styling**: CSS modules/tokens and utility classes, with Tailwind available in the toolchain

## Running the project

```bash
# Install dependencies
yarn

# Start dev server
yarn dev
```

For more details about structure, setup, and labs, check the docs under `docs/`.
