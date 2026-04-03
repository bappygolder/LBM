# Keyboard Shortcuts

## Design Philosophy

Shortcuts in the LBM follow a single rule: **do what the user will naturally reach for first.**

- `Escape` always dismisses, closes, or clears — in every context, in that priority order.
- `Delete` and `Backspace` both delete. A user reaching for either should get the same result.
- `D` navigates to the Docs tab from anywhere. `Delete` and `Backspace` are the primary delete keys. `Shift+D` is a secondary delete shortcut for power users.
- Arrow keys navigate. `Enter` opens/confirms. These never need explaining.
- Letter shortcuts (`N`, `?`, `/`) are single-key actions that don't conflict with text input because they are blocked while a field is focused.

If a new action is added and there is an obvious key a user would press, use that key. Don't invent conventions — observe habits.

---

> Shortcuts are active when no text field, textarea, or notes editor is focused.
> `Ctrl+N` and `Escape` always work regardless of focus.

---

## Tab Navigation

Works on every page.

| Action | Key |
|---|---|
| Go to Actions | `A` |
| Go to Docs | `D` |
| Go to Resources | `R` |
| Open / close menu | `M` |
| Switch to List view | `L` |
| Switch to Board view | `B` |

> **Already here?** If you press `A`, `D`, `R`, `L`, or `B` while already on that page or view, a brief nudge appears confirming your location — no navigation happens.

> **Menu keyboard nav:** When the menu is opened with `M`, the first item is focused automatically. Use `↑` / `↓` to move between items, `Home` / `End` to jump to first or last, and `Esc` to close.

---

## Global

| Action | Key |
|---|---|
| New item | `N` |
| New item — works even while a field is focused | `Ctrl+N` / `Cmd+N` |
| Focus search bar | `/` |
| Toggle shortcuts panel | `?` |
| Close any modal, panel, or form | `Esc` |
| Undo (delete · lane change · title edit) | `Cmd+Z` / `Ctrl+Z` |

---

## Docs Page

| Action | Key |
|---|---|
| Navigate to previous doc | `←` |
| Navigate to next doc | `→` |
| Focus search | `S` |
| Hide / show sidebar | Sidebar toolbar buttons |

> Arrow keys navigate across all sections (Documentation → Skills → Roadmap) in order.
> Navigation respects active search filters — only visible items are traversed.

---

## List View

### Navigation

| Action | Key |
|---|---|
| Focus next task | `↓` |
| Focus previous task | `↑` |
| Scroll page down | `Shift+↓` |
| Scroll page up | `Shift+↑` |
| Open focused task | `Enter` |
| Delete focused task (Cmd+Z to undo) | `Delete` · `⌫` · `Shift+D` |
| Jump to last deleted position | `←` / `→` |
| Clear row focus | `Esc` |

---

## Detail Panel

| Action | Key |
|---|---|
| Delete this task (Cmd+Z to undo) | `Delete` · `⌫` · `Shift+D` |
| Close panel | `Esc` |

### Notes Editor

| Action | Key |
|---|---|
| Bold | `Cmd+B` / `Ctrl+B` |
| Italic | `Cmd+I` / `Ctrl+I` |
| Bullet list | `Cmd+Shift+8` / `Ctrl+Shift+8` |

---

## Board View

### Inline Form

| Action | Key |
|---|---|
| Save task | `Enter` |
| Cancel | `Esc` |

---

## Multi-Select (List & Board)

Select multiple tasks by clicking and dragging on empty space. The rubber-band rectangle
can be started from any direction — left, right, top, or bottom of the content area.

After moving selected tasks (reorder in list view, or drag to another column in board view),
the items **stay selected** so you can continue acting on them. The selection only dissolves
when you explicitly dismiss it.

| Action | How |
|---|---|
| Start selection | Click and drag on empty space |
| Toggle item in/out of selection | Click a task while items are selected |
| Delete all selected | `Delete` · `Backspace` · `Shift+D` (or click Delete in the action bar) |
| Drag selected tasks to new position | Drag any selected task — all move together |
| Move selected cards to another column | Drag any selected card to the target column |
| Dismiss selection (slow dissolve) | `Esc` · click × in the action bar · click on empty space |
