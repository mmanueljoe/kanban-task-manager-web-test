# All State in the Store + Drag-and-Drop

This doc explains the thought process and approach for (1) moving **all** shared state into the Zustand store and (2) adding **drag-and-drop** for moving tasks. It is written in plain English so you can use it for lab review and to learn the reasoning behind each change.

---

## Part 1: Why Move All State to the Store?

The lab says: _"Your main goal is to move all shared state from components or context into a dedicated store."_ So we are not only moving boards—we are moving **every** piece of shared state that used to live in React Context or in components into one central store.

**What counts as "shared state"?**

- **Boards** – already in the store (boards, columns, tasks).
- **Theme** – light/dark mode. Used by the root (data-theme) and by Header/Aside for the toggle. It was in ThemeContext; it moves to the store.
- **Auth** – who is logged in (user, isLoggedIn, login, logout). Used by Login, Admin, ProtectedRoute. It was in AuthContext; it moves to the store.
- **UI feedback** – loading overlay keys and toasts. Used by StoreHydration, modals, ToastHost, LoadingOverlay. It was in UiContext; the **data** (loadingKeys, toasts) moves to the store. The **behavior** (e.g. "show loading for at least 300ms") stays in a thin layer that uses refs and calls the store.

So the idea is: **one store holds all of that.** Any component that needs theme, auth, boards, or UI state reads from the store (or from a hook that reads from the store). No more ThemeProvider, AuthProvider, or BoardsProvider. We keep one small UiProvider only because it holds **refs** for the loading timers (which cannot live in the store in a clean way); the actual state (loadingKeys, toasts) lives in the store.

---

## Part 2: How the Store Is Structured (Plain English)

The store is **one JavaScript object**. It has:

1. **Boards** – `boards` (array of boards) and `dispatch` (function that runs your reducer and updates boards). Same as before.
2. **Theme** – `theme` ('light' | 'dark') and `setTheme(next)`. When you call `setTheme`, we update the store and write to localStorage so the choice survives refresh.
3. **Auth** – `user`, `isLoggedIn`, `login(user)`, `logout()`. When you call `login` or `logout`, we update the store and write to localStorage.
4. **UI** – `loadingKeys` (array of strings), `toasts` (array of toasts), and actions: `addLoadingKey(key)`, `removeLoadingKey(key)`, `addToast(toast)`, `removeToast(id)`. Components that show loading call `addLoadingKey` / `removeLoadingKey`; components that show toasts call `addToast`; ToastHost calls `removeToast(id)` when a toast is dismissed. The **state** is in the store; the **300ms minimum loading** logic lives in UiProvider (it uses refs to remember start times and timeouts, and calls `addLoadingKey` / `removeLoadingKey` on the store).

So when we say "all state in the store," we mean: the store is the only place that holds boards, theme, auth, loadingKeys, and toasts. Components never keep their own copy of that data; they read it from the store and update it by calling the store’s functions (dispatch, setTheme, login, logout, addLoadingKey, removeLoadingKey, addToast, removeToast).

---

## Part 3: Why We Still Have UiProvider (And Nothing Else)

Theme and auth do not need refs or timers. We can put theme and auth entirely in the store and remove ThemeProvider and AuthProvider.

UI (loading and toasts) is different: we want the loading overlay to stay visible for **at least 300ms** so the user sees it. That means when someone calls `stopLoading(key)`, we do not remove the key from the store immediately—we wait until 300ms have passed since `startLoading(key)`. That requires:

- Remembering **when** each key started (e.g. in a ref).
- Scheduling a **timeout** to remove the key later (and clearing that timeout if needed).

Refs and timeouts are not something we want to put inside the store (the store is for serializable state and simple actions). So we keep a **thin UiProvider** that:

- Holds refs for start times and timeout IDs.
- Exposes `startLoading(key)` and `stopLoading(key)` that use those refs and call the store’s `addLoadingKey(key)` and `removeLoadingKey(key)`.

So: **state** (loadingKeys, toasts) is in the store; **behavior** (300ms minimum) is in UiProvider. That way we satisfy "all state in the store" while keeping the loading UX.

---

## Part 4: How Components Use the Store After the Change

- **Theme** – Components that need theme (e.g. App, Header, Aside) use `useTheme()`, which now reads `theme` and `setTheme` from the store. No ThemeProvider.
- **Auth** – Components that need auth (Login, Admin, ProtectedRoute) use `useAuth()`, which now reads `user`, `isLoggedIn`, `login`, `logout` from the store. No AuthProvider.
- **Boards** – Same as before: `useBoards()` reads `boards` and `dispatch` from the store.
- **UI** – Components use `useUi()`, which reads `loadingKeys` and `toasts` from the store and `startLoading`, `stopLoading`, `showToast`, `isLoading` from UiProvider (which in turn calls the store). ToastHost and LoadingOverlay read from the store via useUi; when the user dismisses a toast, they call `removeToast(id)` on the store.

So from the component’s point of view, almost nothing changes: they still use the same hooks. Only the **implementation** of those hooks changes (they read from the store instead of from Context). That keeps the refactor small and easy to follow.

---

## Part 5: Drag-and-Drop – Idea and Approach

The lab extension asks for drag-and-drop to move tasks (e.g. with @dnd-kit or react-beautiful-dnd). The important idea: **moving a task is still a change in the store.** We already have an action `MOVE_TASK` that takes boardIndex, fromColumn, toColumn, and taskTitle. So:

- **Before DnD** – The user might click "Move to column X" and we dispatch `MOVE_TASK`.
- **After DnD** – The user drags a task and drops it on a column; we still dispatch `MOVE_TASK` with the same payload.

So we do **not** add new state for "dragging." We only add **a new way to trigger** the same action: the drag-and-drop library detects "task A was dropped on column B" and we call `dispatch({ type: 'MOVE_TASK', payload: { ... } })`. The store remains the single source of truth; the UI (including the drag overlay) is derived from the store.

**Implementation choice:** We use **@dnd-kit** (e.g. `@dnd-kit/core` and `@dnd-kit/utilities`). It’s well maintained and works with React 18+.

**Steps (implemented in BoardView):**

1. Install `@dnd-kit/core` and `@dnd-kit/utilities`: run `yarn add @dnd-kit/core @dnd-kit/utilities` (or the versions are already in `package.json`; run `yarn install`).
2. Wrap the board columns in `<DndContext sensors={...} onDragEnd={handleDragEnd}>`. When a drag ends, `onDragEnd` receives the dragged item (task) and the drop target (column).
3. Each **task** is a **draggable**: we use `useDraggable` and give it an id that encodes `boardIndex::columnName::taskTitle` (using `::` so task titles can contain colons when we split). We decode this in `onDragEnd` to get fromColumn and taskTitle.
4. Each **column** is a **droppable**: we use `useDroppable` and give it an id `boardIndex::columnName` so we know which column received the drop.
5. In `handleDragEnd`: parse the draggable id (source column, task title) and the droppable id (target column). If source and target are different, dispatch `MOVE_TASK` with boardIndex, fromColumn, toColumn, taskTitle. If they are the same, we do nothing.

So the flow is: **User drags task → drops on column → onDragEnd runs → we dispatch MOVE_TASK → store updates → UI re-renders with the task in the new column.** No local "dragging" state; everything goes through the store.

---

## Part 6: What We Changed (Summary for Lab Review)

1. **Store** – Expanded to hold theme, auth, and UI state (loadingKeys, toasts) in addition to boards. Added actions: setTheme, login, logout, addLoadingKey, removeLoadingKey, addToast, removeToast. Boards still use dispatch + reducer.
2. **Persistence** – Theme and auth are read from localStorage when the store is created and written to localStorage when setTheme/login/logout are called. Boards and UI state are unchanged (boards via StoreHydration + subscribe; UI state is not persisted).
3. **Providers** – Removed ThemeProvider and AuthProvider. Kept UiProvider only as a thin layer for the 300ms loading logic (refs + store actions). BoardsProvider was already removed earlier.
4. **Hooks** – useTheme and useAuth now read from the store. useBoards unchanged (already from store). useUi reads loadingKeys and toasts from the store and startLoading/stopLoading/showToast/isLoading from UiProvider (which calls the store).
5. **Context files** – ThemeContext and AuthContext are no longer used and can be removed (or left as dead code). UiContext stays because UiProvider still provides the functions that use refs.
6. **Drag-and-drop** – Added @dnd-kit. BoardView wraps columns in DndContext; each task is draggable, each column is droppable. On drop we dispatch MOVE_TASK so the store stays the single source of truth.

7. **Removed context files** – `ThemeContext.tsx` and `AuthContext.tsx` were deleted; theme and auth now live only in the store. The types `ThemeContextType` and `AuthContextType` remain in `types.ts` as the return types of `useTheme()` and `useAuth()`.

---

## Part 7: How to Explain This in a Lab Review

You can say something like:

- **"We moved all shared state into one Zustand store."** That includes boards (and columns/tasks), theme, auth, and UI feedback (loading keys and toasts). The store is the single source of truth; components read from it and update it via actions (dispatch, setTheme, login, logout, addLoadingKey, removeLoadingKey, addToast, removeToast).
- **"We kept one small UiProvider."** The loading overlay must stay visible for at least 300ms. That logic uses refs and timeouts, which we didn’t put in the store. So UiProvider holds those refs and exposes startLoading/stopLoading that call the store. The actual state (loadingKeys, toasts) lives in the store.
- **"We added drag-and-drop with @dnd-kit."** Tasks are draggable and columns are droppable. When the user drops a task on a column, we dispatch the existing MOVE_TASK action. So the store remains the single source of truth; DnD is just another way to trigger the same update.

This doc and the code comments (marked with UPDATED or the reason for the change) are there so you can follow the thought process and explain it clearly in your lab review.
