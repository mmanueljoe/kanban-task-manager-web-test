# Refactoring Changes - Component Architecture Improvements

This document describes the refactoring changes made to improve the separation of logic and presentational components, fix theme inconsistencies, and eliminate code duplication.

## Summary of Changes

The refactoring was done in three phases:

1. **Phase 1**: Fix theme inconsistencies and standardize component usage
2. **Phase 2**: Create reusable hooks and components
3. **Phase 3**: Refactor the Header into smaller, focused components

---

## Critical Fix: Theme Application for Portals

### Problem

Modals and other portaled elements (toasts, dropdowns) were not receiving the dark theme. In dark mode, modals appeared with a white background and text on standalone pages (Admin, NotFound) was black instead of white.

### Root Cause

The `data-theme` attribute was being applied to a `<div className="app-root">` inside the React app, but modals use `createPortal(modal, document.body)` which renders them as direct children of `<body>`, outside the themed div.

### Solution

Changed the theme application from a React div attribute to the document element:

**Before (App.tsx)**:

```tsx
<div data-theme={theme} className="app-root">
  ...
</div>
```

**After (App.tsx)**:

```tsx
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);

return <div className="app-root">...</div>;
```

Also updated `tokens.css` to ensure the dark theme selector works on both the document element and any element with the attribute:

```css
[data-theme='dark'],
:root[data-theme='dark'] {
  /* dark theme variables */
}
```

This ensures that:

1. All portaled content (modals, toasts) inherits the theme
2. The CSS variables are available throughout the entire document
3. Component-level dark mode selectors continue to work

---

## Additional Fix: Delete Task Confirmation Modal

### Problem

When clicking "Delete Task" in the task details modal, the task was deleted immediately without asking for confirmation. This was inconsistent with the board delete flow which shows a confirmation dialog.

### Solution

Created a new `DeleteTaskModal` component (`src/components/modals/DeleteTaskModal.tsx`) that:

- Shows a confirmation dialog with the task name
- Has "Delete" and "Cancel" buttons
- Only deletes the task when the user explicitly confirms

Updated `TaskDetailsModal` to:

- Open the delete confirmation modal when "Delete Task" is clicked
- Close both modals when deletion is confirmed

---

## Phase 1: Theme and Component Consistency

### Problem

- The Admin, NotFound, and Login pages had no visual container, making them look inconsistent with the rest of the app
- Some modals used raw `<input>` elements while others used the `<Input>` component
- The "removable input" pattern (input with a remove button) was duplicated across multiple files

### Solution

#### 1.1 Created PageCard Component

**File**: `src/components/ui/PageCard.tsx`

A new wrapper component that provides consistent styling for standalone page content. It matches the visual style of modals (white/dark background, rounded corners, padding, subtle shadow).

**Usage**:

```tsx
<div className="app-main">
  <PageCard>
    <h1>Page Title</h1>
    <p>Content goes here</p>
  </PageCard>
</div>
```

**Updated pages**:

- `src/pages/Admin.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/Login.tsx`

#### 1.2 Created RemovableInput Component

**File**: `src/components/ui/RemovableInput.tsx`

A reusable component for editable list items that can be removed. Used for:

- Board columns in AddBoardModal and EditBoardModal
- Subtasks in TaskForm

**Props**:

- `value`: The input value
- `onChange`: Called when the value changes
- `onRemove`: Called when the remove button is clicked
- `placeholder`: Optional placeholder text

**Usage**:

```tsx
<RemovableInput
  value={columnName}
  onChange={(v) => updateColumn(index, v)}
  onRemove={() => removeColumn(index)}
  placeholder="e.g. In Progress"
/>
```

#### 1.3 Standardized Input Usage

All form modals now use the `<Input>` component consistently:

- `src/components/modals/AddBoardModal.tsx`
- `src/components/modals/AddColumnModal.tsx`
- `src/components/modals/EditBoardModal.tsx`
- `src/components/modals/TaskForm.tsx`

---

## Phase 2: Reusable Hooks and Components

### Problem

- The "click outside to close" pattern was duplicated in 4+ places
- Each place had its own implementation with slight variations
- Board view had inline component definitions that made the file long and hard to maintain

### Solution

#### 2.1 Created useClickOutside Hook

**File**: `src/hooks/useClickOutside.ts`

A custom hook that detects clicks outside a referenced element. This replaces the duplicated useEffect patterns throughout the codebase.

**Parameters**:

- `ref`: React ref pointing to the element to monitor
- `callback`: Function to call when clicking outside
- `enabled`: Optional boolean to enable/disable the listener (default: true)

**Usage**:

```tsx
const menuRef = useRef<HTMLDivElement>(null);
const [isOpen, setIsOpen] = useState(false);

useClickOutside(menuRef, () => setIsOpen(false), isOpen);

return <div ref={menuRef}>...</div>;
```

#### 2.2 Created PopoverMenu Component

**File**: `src/components/ui/PopoverMenu.tsx`

A reusable dropdown menu component that handles:

- Opening/closing state
- Click-outside to close
- Keyboard navigation (Escape to close)
- Proper ARIA attributes for accessibility

**Usage**:

```tsx
<PopoverMenu trigger={<button>Options</button>} ariaLabel="Task options">
  <PopoverMenu.Item onClick={handleEdit}>Edit</PopoverMenu.Item>
  <PopoverMenu.Item onClick={handleDelete} variant="destructive">
    Delete
  </PopoverMenu.Item>
</PopoverMenu>
```

#### 2.3 Created IconButton Component

**File**: `src/components/ui/IconButton.tsx`

A button component for icon-only buttons with consistent styling. Requires an aria-label for accessibility.

**Usage**:

```tsx
<IconButton
  icon={<img src={iconEllipsis} alt="" width={5} height={20} />}
  aria-label="More options"
  onClick={handleClick}
/>
```

#### 2.4 Created TaskCard Component

**File**: `src/components/ui/TaskCard.tsx`

A pure presentational component that displays a task card with title and subtitle. It has no knowledge of drag-and-drop or business logic.

**Props**:

- `title`: The task title
- `subtitle`: The subtitle (typically subtask count)
- All standard HTML attributes for `<li>` elements

**Usage**:

```tsx
<TaskCard
  title="Build UI components"
  subtitle="2 of 5 subtasks"
  onClick={() => openTaskDetails()}
/>
```

#### 2.5 Created Board-Specific Components

**Folder**: `src/components/board/`

These components handle the drag-and-drop functionality for the Kanban board:

**DraggableTaskCard** (`DraggableTaskCard.tsx`):

- Wraps TaskCard with drag-and-drop functionality
- Creates a unique ID encoding board, column, and task
- Applies visual feedback when dragging (reduced opacity)

**DroppableColumn** (`DroppableColumn.tsx`):

- Creates a drop zone for tasks
- Shows visual feedback when a task is dragged over it
- Renders column header with colored dot and task count

**Utility Functions** (`boardDndUtils.ts`):

- `encodeTaskId` / `decodeTaskId`: Encode/decode task identity for drag IDs
- `encodeColumnId` / `decodeColumnId`: Encode/decode column identity for drop IDs

**Index file** (`index.ts`):

- Re-exports all board components for easy importing

---

## Phase 3: Header Refactoring

### Problem

The Header component was 354 lines long with:

- Multiple local states for different menus
- Three separate dropdown menus with duplicated logic
- Business logic mixed with presentation
- Lots of inline styles

### Solution

Split the Header into four focused components:

#### 3.1 BoardSelector Component

**File**: `src/components/layout/BoardSelector.tsx`

The mobile-friendly board selection dropdown. Shows:

- Current board name (or "Boards" if none selected)
- Chevron indicating the dropdown
- List of all boards when open
- Create board option
- Theme toggle

#### 3.2 AccountMenu Component

**File**: `src/components/layout/AccountMenu.tsx`

User avatar with account-related actions:

- Circular avatar showing user's initial
- Dropdown menu with Admin and Logout options

#### 3.3 BoardOptionsMenu Component

**File**: `src/components/layout/BoardOptionsMenu.tsx`

Edit and delete actions for the current board:

- Ellipsis button that opens the menu
- Edit Board option
- Delete Board option (styled as destructive)

#### 3.4 Updated Header Component

**File**: `src/components/layout/Header.tsx`

Now a clean orchestration component (~60 lines) that composes the three new components. It only handles:

- The overall header layout
- The Add Task button
- Passing callbacks to child components

---

## CSS Changes

New CSS classes were added to support the new components:

**layout.css**:

- `.app-page-card`: Themed container for standalone pages
- `.app-header-board-trigger-text`: Text styling for board trigger
- `.app-header-board-chevron`: Chevron icon with rotation animation
- `.app-account-menu`, `.app-account-menu-trigger`, `.app-account-menu-panel`: Account menu styles
- `.app-board-options-menu`, `.app-board-options-menu-panel`: Board options menu styles
- `.app-board-dropdown-item-icon`: Icon styling in board dropdown

**components.css**:

- `.app-removable-input`, `.app-removable-input-btn`: Removable input styles
- `.app-icon-btn`, `.app-icon-btn-sm`: Icon button styles
- `.app-popover-menu`, `.app-popover-menu-panel`, `.app-popover-menu-item`: Popover menu styles

**modals.css**:

- `.app-task-details-header`: Task details modal header
- `.app-task-details-menu`, `.app-task-details-menu-panel`: Task menu styles
- `.app-task-details-description`, `.app-task-details-subtasks`: Content styles
- `.app-task-details-status`: Status display styles

---

## File Structure After Refactoring

```
src/
├── components/
│   ├── board/                    # NEW: Board-specific components
│   │   ├── index.ts
│   │   ├── boardDndUtils.ts
│   │   ├── DraggableTaskCard.tsx
│   │   └── DroppableColumn.tsx
│   ├── layout/
│   │   ├── AccountMenu.tsx       # NEW: Extracted from Header
│   │   ├── Aside.tsx
│   │   ├── BoardOptionsMenu.tsx  # NEW: Extracted from Header
│   │   ├── BoardSelector.tsx     # NEW: Extracted from Header
│   │   ├── Header.tsx            # SIMPLIFIED
│   │   └── Layout.tsx
│   ├── modals/
│   │   ├── AddBoardModal.tsx     # UPDATED: Uses RemovableInput
│   │   ├── AddColumnModal.tsx    # UPDATED: Uses Input component
│   │   ├── EditBoardModal.tsx    # UPDATED: Uses RemovableInput
│   │   ├── TaskDetailsModal.tsx  # UPDATED: Uses useClickOutside
│   │   ├── TaskForm.tsx          # UPDATED: Uses RemovableInput
│   │   └── ...
│   └── ui/
│       ├── IconButton.tsx        # NEW
│       ├── PageCard.tsx          # NEW
│       ├── PopoverMenu.tsx       # NEW
│       ├── RemovableInput.tsx    # NEW
│       ├── TaskCard.tsx          # NEW
│       └── ...
├── hooks/
│   ├── useClickOutside.ts        # NEW
│   └── ...
├── pages/
│   ├── Admin.tsx                 # UPDATED: Uses PageCard
│   ├── BoardView.tsx             # UPDATED: Uses board components
│   ├── Login.tsx                 # UPDATED: Uses PageCard
│   └── NotFound.tsx              # UPDATED: Uses PageCard
└── styles/
    ├── components.css            # UPDATED: New component styles
    ├── layout.css                # UPDATED: New layout styles
    └── modals.css                # UPDATED: New modal styles
```

---

## Benefits of These Changes

1. **Better separation of concerns**: Logic is separated from presentation. Pure UI components (TaskCard, PageCard) have no business logic.

2. **Reduced duplication**: The click-outside pattern is now in one place. The removable input pattern is reusable.

3. **Smaller, focused components**: Header went from 354 lines to ~60 lines. Each component has a single responsibility.

4. **Easier testing**: Pure presentational components can be tested in isolation. The board DnD logic is separated from the visual components.

5. **Consistent theming**: All standalone pages now use PageCard for consistent visual treatment. All form inputs use the Input component.

6. **Improved maintainability**: Smaller files are easier to understand and modify. Related code is grouped together.

---

## Code Review Fixes (Latest)

The following issues were identified during code review and have been addressed:

### 1. Fixed Typo: TOOGLE_SUBTASK → TOGGLE_SUBTASK

The action type had a spelling error that was propagated across multiple files:

**Files Updated:**

- `src/types/types.ts` - Changed action type in BoardsAction union
- `src/utils/boardsReducer.ts` - Updated case statement
- `src/components/modals/TaskDetailsModal.tsx` - Updated dispatch call
- `src/test/boardsReducer.test.ts` - Updated test
- `src/test/TaskDetailsModal.test.tsx` - Updated test expectation

### 2. Fixed Typo: "substask" → "subtask"

**File:** `src/pages/BoardView.tsx`

The `getSubtaskSummary` function was displaying "substask" instead of "subtask".

**Before:** `${done} of ${total} substask${total !== 1 ? 's' : ''}`
**After:** `${done} of ${total} subtask${total !== 1 ? 's' : ''}`

Also updated the corresponding test assertion in `src/test/BoardView.test.tsx`.

### 3. Added Unique IDs to Tasks

Tasks now have a unique `id` field for better tracking and keying in React lists.

**Changes:**

- **`src/types/types.ts`**: Added `id: string` to Task type and `generateTaskId()` function
- **`src/services/boards.ts`**: Added `ensureTaskIds()` function to add IDs to legacy data without them
- **`src/components/modals/AddTaskModal.tsx`**: Now generates an ID when creating new tasks
- **`src/pages/BoardView.tsx`**: Now uses `task.id` as the key instead of `task.title`
- Updated all test files to include task IDs in test data

The `id` field uses the format `task-{timestamp}-{random}` for guaranteed uniqueness.

### 4. Removed Duplicate AddColumnModal

**File:** `src/pages/BoardView.tsx`

The `AddColumnModal` was rendered in two places:

1. Inside the empty board state return block
2. At the end of the main render

This caused potential issues with modal state. Consolidated to render the modal once at the end of each return path.

### 5. Added Error Handling to Delete Operations

**Files:**

- `src/components/modals/DeleteBoardModal.tsx`
- `src/components/modals/DeleteTaskModal.tsx`

Added try-catch blocks around dispatch calls to handle potential errors and show appropriate toast messages.

**Before:**

```tsx
try {
  dispatch({ type: 'DELETE_BOARD', payload: { boardIndex } });
  showToast({ type: 'success', message: 'Board deleted' });
} finally {
  stopLoading('deleteBoard');
}
```

**After:**

```tsx
try {
  dispatch({ type: 'DELETE_BOARD', payload: { boardIndex } });
  showToast({ type: 'success', message: 'Board deleted' });
} catch (error) {
  showToast({
    type: 'error',
    message: 'Failed to delete board. Please try again.',
  });
} finally {
  stopLoading('deleteBoard');
}
```

### 6. Updated Favicon

**Files:**

- `index.html` - Updated link tag to use custom favicon
- `public/favicon.png` - Copied from `src/assets/favicon-32x32.png`

Changed from the default Vite favicon to the project's custom favicon. Also updated the page title to "Kanban Task Manager".

---

## Test Impact

All existing tests continue to pass without modification. This is because:

- Tests check rendered output, not implementation details
- Tests mock at the hook/modal boundaries, not internal components
- The same HTML structure and text content is rendered

The test for task deletion was updated to account for the confirmation modal:

- `src/test/TaskDetailsModal.test.tsx` - Added mock for `DeleteTaskModal` and updated test to click through confirmation

You may optionally add tests for the new components (TaskCard, PageCard, useClickOutside, etc.) for better coverage.
