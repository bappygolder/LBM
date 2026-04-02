# SKILL: Add a Keyboard Shortcut to LBM

Use this skill whenever a new keyboard shortcut is added to the Local Business Manager. It ensures the shortcut appears consistently across all five locations it must exist.

---

## When to trigger

The user says something like:
- "Add a shortcut for X"
- "Make [key] do [action]"
- "Add a keyboard shortcut to [action]"

---

## The 6 locations — touch all of them

Every new shortcut must be added to **all six** of these locations. Missing any one creates an inconsistency.

| # | File | What to update |
|---|---|---|
| 1 | `task-app.js` | Add the key handler logic |
| 2 | `styles.css` | Add any new styles needed (e.g. for confirm dialogs) |
| 3 | `index.html` | Add a `<div class="shortcuts-row">` in the right group in `#shortcutsPanel` |
| 4 | `docs/KEYBOARD_SHORTCUTS.md` | Add a row to the right table |
| 5 | `data/docs-content.js` | Mirror the change from step 4 (it's a pre-rendered cache) |
| 6 | Visible UI element (if applicable) | Add `<span class="shortcut-tooltip">` inside the button or link |

---

## Step-by-step process

### Step 1 — Implement in task-app.js

**Where:** Inside the global `document.addEventListener("keydown", e => { ... })` block (around line 596).

**Guard pattern** — shortcuts must not fire when the user is typing:
```javascript
const tag = document.activeElement.tagName;
if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement.isContentEditable) return;
// your shortcut goes after this guard
```

**Template:**
```javascript
if (e.key === "x" || e.key === "X") {
  // check the right context (detail panel open? list row focused?)
  e.preventDefault();
  // call the action
  return;
}
```

**Context checks:**
- Detail panel open: `!el.detailOverlay.hidden && detailTaskId`
- Focused list row: `document.querySelector(".list-row.is-focused")`

**If the shortcut needs confirmation** (like delete), use the `confirmDelete` pattern as a model — or create a generic `confirmAction(message, onConfirm)` helper. Store "don't ask again" preferences in `localStorage` under a key like `lbm_skip<ActionName>Confirm`.

---

### Step 2 — Add styles if needed (styles.css)

Only needed if the shortcut introduces new UI (e.g. a confirm dialog). Insert styles near the relevant section (modals are around line 2009, delete confirm dialog follows the modal footer section).

---

### Step 3 — Add to shortcuts panel (index.html)

Find `#shortcutsPanel` (around line 494). Add a row to the correct group:

```html
<div class="shortcuts-row"><kbd>X</kbd><span>What it does</span></div>
```

**Groups available:**
- `Global` — works everywhere, always
- `List View — Navigation` — list view, no text field focused
- `Detail Panel` — while the detail panel is open
- `Detail Panel — Notes Editor` — inside the notes editor
- `Board View — Inline Form` — while the board inline form is open

**Multi-key example:**
```html
<div class="shortcuts-row"><kbd>Shift</kbd><kbd>X</kbd><span>What it does</span></div>
```

---

### Step 4 — Update docs/KEYBOARD_SHORTCUTS.md

Add a row to the correct table. Match the exact format already used:

```markdown
| `X` | What it does |
```

For modifier keys:
```markdown
| `Shift+X` | What it does |
| `Cmd+X` / `Ctrl+X` | What it does |
```

---

### Step 5 — Update data/docs-content.js (cache sync)

This file is a pre-rendered cache of the markdown docs. Find the `"docs/KEYBOARD_SHORTCUTS.md"` key (around line 558) and mirror the exact change from Step 4.

The format is an array of strings joined with `\n`. Each markdown line is one string. For a table row:
```javascript
"| `X` | What it does |",
```

**Important:** Escape any double quotes inside strings: `"Don't ask again"` → `"Don't ask again"` (single quotes are fine, but double quotes need `\"`).

---

### Step 6 — Add tooltip to visible UI element (if applicable)

If the shortcut is bound to a **visible, interactive element** (a tab link, a toolbar button, a view toggle, etc.), add a `.shortcut-tooltip` span as the **last child** inside that element so the shortcut is discoverable on hover.

**Rules:**
- The parent element must have `position: relative`. All `.tab` links already do. For other elements (e.g. `.view-button`), add `position: relative` in `styles.css`.
- Tooltip text format: brief action label + one or more `<kbd>` elements.
- Skip this step for shortcuts with no corresponding interactive UI element (e.g. arrow-key navigation, `Esc`, scroll).
- If the shortcut is on a tab or button that exists on **multiple pages** (e.g. all three HTML files), add the tooltip to all of them.

**Single-key example:**
```html
<button class="view-button">
  List View
  <span class="shortcut-tooltip">List view <kbd>L</kbd></span>
</button>
```

**Multi-key example (two `<kbd>` elements):**
```html
<a class="tab" href="docs.html">
  Docs
  <span class="shortcut-tooltip">Go to Docs <kbd>Shift</kbd><kbd>D</kbd></span>
</a>
```

The `.shortcut-tooltip` component is defined in `styles.css` under the `/* ─── Shortcut tooltip */` comment. It handles all positioning, animation, and kbd styling — no extra CSS needed for most shortcuts.

---

## Checklist before finishing

- [ ] Key handler added in `task-app.js` with correct context guard
- [ ] If confirm dialog needed: uses `confirmDelete` pattern with localStorage "don't ask again"
- [ ] Styles added to `styles.css` (if new UI introduced)
- [ ] `index.html` shortcuts panel has the new row in the right group
- [ ] `docs/KEYBOARD_SHORTCUTS.md` table updated
- [ ] `data/docs-content.js` cache updated to match the markdown
- [ ] If shortcut maps to a visible interactive element: `.shortcut-tooltip` added to that element (and all pages it appears on)

---

## Example: D for Delete (reference implementation)

This shortcut was added as the reference implementation of this skill.

**Behavior:**
- Works in list view when a row has `.is-focused`
- Works in detail panel when it's open
- First use shows a confirm dialog with "Don't ask again" checkbox
- Preference stored in `localStorage` as `lbm_skipDeleteConfirm`

**Key handler (task-app.js):**
```javascript
if (e.key === "d" || e.key === "D") {
  if (!el.detailOverlay.hidden && detailTaskId) {
    e.preventDefault();
    const t = getTask(detailTaskId);
    if (t) confirmDelete(() => { deleteTask(t.id); closeDetail(); });
    return;
  }
  const focused = document.querySelector(".list-row.is-focused");
  if (focused && focused.dataset.taskId) {
    e.preventDefault();
    const tid = focused.dataset.taskId;
    focused.classList.remove("is-focused");
    confirmDelete(() => deleteTask(tid));
  }
}
```

**confirmDelete helper (task-app.js):**
```javascript
function confirmDelete(onConfirm) {
  if (localStorage.getItem("lbm_skipDeleteConfirm") === "true") { onConfirm(); return; }
  const overlay = document.createElement("div");
  overlay.className = "delete-confirm-overlay";
  overlay.innerHTML = `
    <div class="delete-confirm-dialog">
      <div class="delete-confirm-header">
        <p class="delete-confirm-title">Delete this task?</p>
        <p class="delete-confirm-sub">This action cannot be undone.</p>
      </div>
      <label class="delete-confirm-skip"><input type="checkbox" id="deleteSkipCheck"><span>Don't ask again</span></label>
      <div class="delete-confirm-actions">
        <button class="ghost" id="deleteCancelBtn">Cancel</button>
        <button class="danger" id="deleteConfirmBtn">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const cancelBtn  = overlay.querySelector("#deleteCancelBtn");
  const confirmBtn = overlay.querySelector("#deleteConfirmBtn");
  const cleanup = () => overlay.remove();
  cancelBtn.onclick  = cleanup;
  confirmBtn.onclick = () => {
    if (overlay.querySelector("#deleteSkipCheck").checked) localStorage.setItem("lbm_skipDeleteConfirm", "true");
    cleanup();
    onConfirm();
  };
  overlay.addEventListener("click", e => { if (e.target === overlay) cleanup(); });
  overlay.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft")  { e.preventDefault(); cancelBtn.focus(); }
    if (e.key === "ArrowRight") { e.preventDefault(); confirmBtn.focus(); }
  });
  const escH = e => { if (e.key === "Escape") { cleanup(); document.removeEventListener("keydown", escH); } };
  document.addEventListener("keydown", escH);
  confirmBtn.focus();
}
```

**Button classes used** — these are global app button styles in `styles.css`:
- `button.ghost` → muted border, transparent bg (Cancel)
- `button.danger` → `var(--danger)` red bg (Delete)

**Arrow key nav** — `←` focuses Cancel, `→` focuses Delete. Tab cycles naturally.
