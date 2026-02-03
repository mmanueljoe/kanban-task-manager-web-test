# API Refactor: Step-by-Step Thought Process

This document explains the reasoning behind refactoring the Kanban app to load board data from an API instead of static/local data, without breaking existing functionality.

---

## 1. What We Had Before

- **Data source:** Boards were loaded from either `localStorage` (if the user had visited before) or a static import from `src/data/data.json`.
- **Flow:** On app mount, `StoreHydration` ran an effect that read `getBoards()?.boards ?? data.boards`, then dispatched `SET_BOARDS` into the global store. A second effect subscribed to store changes and wrote boards back to `localStorage`.
- **Problems for the lab:** No real “API” call, no loading/error UX beyond a short delay, and no retry on failure.

---

## 2. Goal (Without Breaking Anything)

- Load boards from an API (in our case, the static file `public/api/boards.json` fetched over HTTP).
- Show loading state while fetching.
- Show a clear error message and a Retry button if the fetch fails.
- Keep the rest of the app working: navigation, board switching, task CRUD, drag-and-drop, and persistence of in-app edits to `localStorage` (so a refresh still shows the user’s changes until we have a real backend).

---

## 3. Step-by-Step Thought Process

### Step 1: Where should the API call live?

- **Idea:** The app already had a single place that “hydrates” boards on load: `StoreHydration`. So the API call should live there, not scattered across components.
- **Decision:** Keep the “load boards once on app start” logic in `StoreHydration`, but change _how_ we get the data: instead of `getBoards()` + `data.json`, we call a dedicated function that performs an HTTP request.

### Step 2: Who actually does the HTTP request?

- **Idea:** We don’t want `StoreHydration` to know about axios, URLs, or response shapes. That would mix UI/flow logic with network details.
- **Decision:** Introduce a small API layer in `src/services/boards.ts` with a single function, e.g. `fetchBoards()`, that returns a Promise of `Board[]`. The component only calls `fetchBoards()` and dispatches the result; the service owns the URL and axios.

### Step 3: What URL should the app call?

- **Idea:** The data file lives at `public/api/boards.json`. In development (Vite) and on Vercel, files in `public/` are served from the root, so the same app can request `/api/boards.json` (same origin, no CORS).
- **Decision:** Use a base URL that defaults to `''` (same origin). So the full URL is `/api/boards.json`. If we later point to another host (e.g. a real backend), we can set `VITE_API_BASE_URL` and the service will build `${baseUrl}/api/boards.json`. No code change in components.

### Step 4: How do we make the API function usable in the effect?

- **Idea:** The original `fetchBoards()` in `boards.ts` did not return anything; it only chained `.then()` and `.catch()`. So `await fetchBoards()` in the component would get `undefined`.
- **Decision:** Make `fetchBoards()` an `async` function that returns `Promise<Board[]>`. It should `await axios.get(...)` and return `data.boards`. If the request fails, we let the error propagate so the component can catch it and show the error UI (we don’t swallow errors in the service).

### Step 5: How do we run an async fetch inside useEffect?

- **Idea:** `useEffect` must not be an async function (React expects a cleanup or nothing). So we can’t write `useEffect(async () => { ... }, [])`.
- **Decision:** Use an async IIFE inside the effect: `void (async () => { ... })()`. We `await fetchBoards()` inside that function, then dispatch `SET_BOARDS` on success. We call `startLoading('initBoards')` at the start and `stopLoading('initBoards')` in a `finally` block so the existing loading overlay always turns off when the request finishes.

### Step 6: What if the user navigates away or retries before the request finishes?

- **Idea:** If we increment a “retry” counter, the effect will re-run and start a new request. The previous request might still complete later and dispatch old data.
- **Decision:** Use a `cancelled` flag set to `true` in the effect’s cleanup. Inside the async IIFE, after `await fetchBoards()` and before dispatching or setting error state, check `if (!cancelled)`. So we only update state if the effect is still “active”; if the user triggered a retry or left the tree, we ignore the old response.

### Step 7: How do we show an error and allow retry?

- **Idea:** We need (1) a place to store the error message and (2) a way to re-run the effect so the user can retry.
- **Decision:** Use local state in `StoreHydration`: `loadError` (string | null) and `retryAttempt` (number). On catch, set `loadError` and call `showToast` so the user gets immediate feedback. Add `retryAttempt` to the effect’s dependency array; the Retry button’s onClick does `setLoadError(null)` and `setRetryAttempt((a) => a + 1)`. The effect runs again, clears the error at the start, and fetches again.

### Step 8: When do we show the error screen instead of the app?

- **Idea:** We should only block the whole app with an error screen when we actually failed _and_ we have no boards to show (so the user can’t do anything useful).
- **Decision:** If `loadError` is set and `boards.length === 0`, render a small error view (message + Retry button). Otherwise render `children` as usual. So after a successful load, even if a later background refetch failed, we wouldn’t hide the app.

### Step 9: Should we keep writing boards to localStorage?

- **Idea:** The lab says “rely entirely on API-provided data” for the _initial_ load. It doesn’t say we must remove persistence of user edits.
- **Decision:** Keep the second effect that subscribes to the store and calls `setBoards({ boards: state.boards })`. That way, in-app changes (add task, move column, etc.) are still persisted and survive a refresh. The _source of truth on first load_ is the API; after that, we still avoid losing the user’s work until we have a real backend that accepts writes.

### Step 10: What do we remove?

- **Decision:** Remove the static import of `data.json` and any use of `getBoards()` for the initial load. Remove the fallback in the catch block that dispatched `data.boards` (so we don’t silently fall back to static data on error). We do not delete `src/data/data.json` or the localStorage helpers; they’re just no longer used for _loading_ the initial boards. The canonical data for the “API” is `public/api/boards.json`.

---

## 4. File-by-File Summary

| File                                | Change                                                                                                                                                                                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/boards.ts`            | `fetchBoards()` now returns `Promise<Board[]>`, uses same-origin default URL (`/api/boards.json`), and lets errors propagate.                                                                                                                              |
| `src/store/StoreHydration.tsx`      | Initial load uses `fetchBoards()` in an async IIFE; adds `loadError` and `retryAttempt` state; shows error + Retry when fetch fails and there are no boards; removes `data.json` and `getBoards()` for load; keeps localStorage subscribe for persistence. |
| `docs/API-REFACTOR-STEP-BY-STEP.md` | This document.                                                                                                                                                                                                                                             |

---

## 5. Data Flow After Refactor

```
App mount
  → StoreHydration effect runs
  → startLoading('initBoards')  →  LoadingOverlay shows
  → fetchBoards()  →  GET /api/boards.json  (axios)
  → success: dispatch SET_BOARDS  →  store.boards updated  →  UI renders boards
  → failure: setLoadError + showToast  →  if no boards, show error screen + Retry
  → finally: stopLoading('initBoards')  →  LoadingOverlay hides
```

Retry: user clicks Retry → `retryAttempt` increments → effect re-runs → same flow.

---

## 6. What Stays the Same (No Breakage)

- Global store shape and `boardsReducer` are unchanged.
- All components that use `useBoards()`, `useCurrentBoard()`, or the store still work.
- Navigation, board switching, add/edit/delete task, drag-and-drop, and theme/auth all behave as before.
- Boards are still persisted to localStorage on change so a refresh keeps the user’s edits; only the _initial_ load comes from the API.
