# SKILL.md — LTM Development Guide

How to develop and extend the Local Task Manager.

---

## RUNNING THE APP

No build step. Open `index.html` directly in a browser:

```bash
open TaskTracker/index.html
```

Or serve locally to avoid CORS issues with doc file loading:

```bash
cd TaskTracker && python3 -m http.server 8080
# Open http://localhost:8080
```

---

## ADDING A NEW FEATURE

1. **New task field** → update `normalizeTask()` in `task-app.js` to add the field with a default, add it to the modal form in `index.html`, and handle it in `handleSubmit()`.
2. **New board column** → update `DEFAULT_BOARD_COLUMNS` in `task-app.js` and add the lane key to `ALL_LANES` / `ACTIVE_LANES` as appropriate.
3. **New page** → copy the header from `docs.html`, add the tab to all 3 pages (index, docs, resources), import `styles.css` and `project-data.js`.
4. **New doc** → add an entry to the `docs` array in `project-data.js`. The docs viewer picks it up automatically.

---

## SEED DATA

Task seed data lives in `project-data.js` under `window.MCCProjectData.tracker.tasks`. To reset a browser to the latest seed: open the info panel (ⓘ button) and click "Reset to Seed".

---

## UPDATING STYLES

All styles live in `styles.css`. Design tokens are CSS variables at the top (`:root`). The dark theme uses:
- `--bg` `--surface` `--border` for backgrounds
- `--accent` (purple) and `--done` (teal) for action colours
- `--text` `--muted` `--muted-soft` for text hierarchy

---

## NOTES EDITOR (contenteditable)

The task detail panel uses a `contenteditable` div (`#notesEditor`). Content is saved as HTML into `task.body`. The plain-text preview in list/board rows reads `task.notes`.

**Future migration to BlockNote:**
When this project moves to a React + Vite setup, replace the `#notesEditor` div and its binding in `task-app.js` with a BlockNote component. The `getEditorContent()` / `setEditorContent()` helpers make the swap straightforward.

---

## RESOURCES FOLDER

Place design assets, exported icons, or reference files in `resources/`. Update `resources.html` to list new items. These files are committed to git but not bundled into any build output.
