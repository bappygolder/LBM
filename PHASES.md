# LBM — Phase Handover Guide

Each phase ends with a commit + push + the self-contained prompt below it.
Copy the prompt block for that phase into a new Claude Code chat window.

---

## ✅ Phase 0 — Completed (this session)

Full LBM redesign. Commit: `347345f` on `main`.

What was built:
- New header: abstract kanban SVG logo, LBM branding, Tasks/Docs/Resources nav
- Toolbar: List View / Board View tabs, collapsible search+filter, + New button, meta-row removed
- List view: tabular, hover ✓ Done button, click to open detail panel
- Board view: 6 columns, Notion-style right-side collapse, 3-dot column menu (rename/move/hide/delete), + New item footer, + Add column button
- Task detail panel: slide-in from right, editable title, properties grid, contenteditable rich-text notes (Cmd+B/I/Shift+8), auto-save
- Resources tab: `resources.html` + `resources/` folder
- `CLAUDE.md` + `SKILL.md` added to `TaskTracker/`

---

## 🔲 Phase 1 — Bug verification & polish

**End-of-phase actions:**
```
git add -A && git commit -m "fix(ltm): phase 1 — bug fixes and UI polish"
git push
```
Then paste the prompt below into a new chat.

---

### PHASE 1 PROMPT — copy everything between the lines

---
**Workspace:** Open `Local Business Manager/` in Claude Code.
Read `CLAUDE.md` and `SKILL.md` before doing anything.

**Context:** The LBM (Local Business Manager) was fully redesigned in the previous session (commit `347345f`). It is a vanilla JS/HTML/CSS app — no build step. Open `index.html` in the browser before starting.

**Your job — fix these known issues one by one, testing in the browser after each:**

1. **Custom columns + list view** — When a column is added via the `+` button on the board, its `dropLane` key (e.g. `custom-1234567`) is not in `ACTIVE_LANES`, so tasks moved into it disappear from List View. Fix: in `task-app.js` → `confirmAddColumn()`, push the new key into `ACTIVE_LANES` at runtime so it appears in list view.

2. **Board full-width** — The board sits inside a `max-width: 1400px` `.page-wrap`. Extract `#boardView` outside `.page-wrap` in `index.html` so when Board View is active, the board runs edge-to-edge. The toolbar and list view should stay inside `.page-wrap`. CSS hint: give `#boardView` `padding: 0 24px 48px; width: 100%;` when active.

3. **Detail panel — lane change** — In the detail panel properties grid, the "Stage" row currently shows read-only text. Make it an inline `<select>` so the user can change the stage directly from the detail panel without opening the edit modal. On change → call `moveTask()` and re-render props. See `refreshDetailProps()` in `task-app.js`.

4. **List view sort controls** — Add a small sort control above the task list (e.g. `Sort: Urgency · Value · Modified`) as text toggles. Default is urgency. Clicking another label re-sorts. Store sort preference in `localStorage` `ui.listSort`.

5. **Visual QA** — Check that all 3 pages (Tasks, Docs, Resources) look correct: consistent header, no broken links, board columns render at the right width.

**End this phase by:**
- Running through all 5 fixes in the browser
- `git add -A && git commit -m "fix(ltm): phase 1 — custom lanes, full-width board, inline stage select, list sort"`
- `git push`
- Producing the Phase 2 prompt (copy from `PHASES.md` in the repo)

---

## 🔲 Phase 2 — UX polish & missing fields

**End-of-phase actions:**
```
git add -A && git commit -m "feat(ltm): phase 2 — UX polish, due date, keyboard shortcuts"
git push
```

---

### PHASE 2 PROMPT — copy everything between the lines

---
**Workspace:** Open `Local Business Manager/` in Claude Code.
Read `CLAUDE.md` and `SKILL.md` before doing anything.

**Context:** The LBM (Local Business Manager) is a vanilla JS/HTML/CSS task tracker — no build step. Open `index.html` in a browser first. Phase 1 bugs are fixed (custom lanes, full-width board, inline stage select, list sort).

**Your job:**

1. **Due date field** — Add `dueDate` (ISO date string, optional) to the task model in `normalizeTask()`. Add a date input to the create/edit modal form. Show it in the detail panel properties grid. In list view, if `dueDate` is set and is today or overdue, show a small coloured date badge next to the task title.

2. **Keyboard shortcuts legend** — Add a small `?` icon button to the toolbar (next to the filter button). Clicking it shows a compact popover listing: `N` new task · `/` search · `Esc` close · `Cmd+B` bold · `Cmd+I` italic. Style consistent with the col-menu popover.

3. **Board card value chip** — If `task.value > 0`, show a small `$X,XXX` chip at the bottom of the board card (similar to existing `.board-card-sublane` style). Keep it subtle — muted text, no border.

4. **Drag handle on board cards** — Replace full-card `draggable` with an explicit `⠿` drag handle (6-dot grid icon, left side of card). Only the handle initiates drag. The rest of the card click opens the detail panel. Update `buildBoardCard()` in `task-app.js`.

5. **Empty state copy** — Update the empty-state messages to be more useful:
   - List view empty: "No active tasks. Press N to add one."
   - Board column empty: "Drop a card here or click + New item"

**End this phase by:**
- Verifying all 5 items in the browser
- `git add -A && git commit -m "feat(ltm): phase 2 — due date, keyboard shortcuts, value chip, drag handle"`
- `git push`
- Producing the Phase 3 prompt (copy from `PHASES.md` in the repo)

---

## 🔲 Phase 3 — BlockNote migration

**End-of-phase actions:**
```
git add -A && git commit -m "feat(ltm): phase 3 — BlockNote rich text editor"
git push
```

---

### PHASE 3 PROMPT — copy everything between the lines

---
**Workspace:** Open `Local Business Manager/` in Claude Code.
Read `CLAUDE.md` and `SKILL.md` before doing anything.

**Context:** The LBM notes editor currently uses a `contenteditable` div. It is designed to be replaced with BlockNote. The swap interface is `getEditorContent()` / `setEditorContent()` in `task-app.js`. `task.body` stores the content.

**Important:** BlockNote requires React. This phase adds a Vite + React build setup to `TaskTracker/`. The existing `index.html`, `styles.css`, `task-app.js` stay as-is except the detail panel notes section gets swapped. Keep the build output separate so the app still opens as `index.html` for non-React parts OR do a full React migration if cleaner.

**Recommended approach (hybrid — minimal change):**
1. Create `TaskTracker/editor/` as a separate mini React app (Vite):
   ```
   cd TaskTracker && npm create vite@latest editor -- --template react
   cd editor && npm install @blocknote/core @blocknote/react @blocknote/mantine
   ```
2. The editor app exposes a custom element / iframe API:
   - Receives content via `postMessage({ type: "set", content: [...blocks] })`
   - Sends changes via `postMessage({ type: "change", content: [...blocks] })`
3. In `task-app.js`, replace `#notesEditor` with an `<iframe src="editor/dist/index.html">` and update `getEditorContent()` / `setEditorContent()` to use postMessage.
4. Style the BlockNote editor to match the dark theme (override BlockNote CSS variables).
5. `editor/dist/` should be built and committed. Add `editor/node_modules/` to `.gitignore`.

**Storage format change:** BlockNote stores content as a JSON block array, not HTML. Update `task.body` to store this JSON string. Update `plainPreview()` in `task-app.js` to extract text from the block JSON for list/board previews.

**End this phase by:**
- Testing: create task → open detail → type rich content → close → reopen → content persists
- `git add -A && git commit -m "feat(ltm): phase 3 — BlockNote rich text editor via iframe bridge"`
- `git push`
- Producing the Phase 4 prompt (copy from `PHASES.md` in the repo)

---

## 🔲 Phase 4 — Portability & multi-project setup

**End-of-phase actions:**
```
git add -A && git commit -m "feat(ltm): phase 4 — portable config, setup script"
git push
```

---

### PHASE 4 PROMPT — copy everything between the lines

---
**Workspace:** Open `Local Business Manager/` in Claude Code.
Read `CLAUDE.md` and `SKILL.md` before doing anything.

**Context:** The LBM is designed to be dropped into any project repo. Right now the project name, areas, and seed tasks are hardcoded in `project-data.js`. This phase makes it fully portable.

**Your job:**

1. **`ltm.config.json`** — Extract project identity out of `project-data.js` into a new `TaskTracker/ltm.config.json`:
   ```json
   {
     "name": "LBM",
     "fullName": "Mac Control Center",
     "storageKey": "mac-control-center-task-tracker-v1",
     "areas": ["project-system", "docs", "product", "platform", "release", "security", "ui-ux"],
     "seedVersion": "2026-03-30-r2"
   }
   ```
   Load this in `project-data.js` via a `fetch("ltm.config.json")` at startup (or inline it — your call based on what works without a build step).

2. **`setup.sh`** — Write a shell script at `TaskTracker/setup.sh` that copies the LBM into a target repo:
   ```bash
   ./setup.sh /path/to/target-repo "My Project Name"
   ```
   It should: copy `TaskTracker/` into the target, replace the name in `ltm.config.json`, clear the seed tasks (leave a blank example), and print next steps.

3. **README update** — Rewrite `TaskTracker/README.md` to be the canonical "how to use LBM in your project" guide. Sections: What is LBM · Running locally · Customising (name, areas, seed tasks) · Adding docs · Column management · Notes on the build exclusion.

4. **`.gitignore` update** — At the root of the Mac Control Centre repo, ensure these are gitignored (if not already): `TaskTracker/editor/node_modules/`, `TaskTracker/editor/dist/` is committed (not ignored).

**End this phase by:**
- `git add -A && git commit -m "feat(ltm): phase 4 — ltm.config.json, setup.sh, README rewrite"`
- `git push`

---

## Notes for all phases

- **Workspace to open:** `0A. Mac Control Centre/TaskTracker/` (or the parent `0A. Mac Control Centre/`)
- **No build step** until Phase 3. Open `index.html` directly in browser.
- **Test after every change** — open browser, check list view, board view, detail panel.
- **Commit format:** `type(ltm): phase N — description`
- **Branch:** work on `main` unless the phase introduces breaking changes (then use a feature branch)
- **`CLAUDE.md`** inside `TaskTracker/` bootstraps Claude Code context automatically when that folder is the workspace.
