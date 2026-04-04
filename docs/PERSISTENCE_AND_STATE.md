# Persistence and State

The Local Business Manager has two persistence layers. Understanding them prevents confusion about where your data is and why changes may or may not be visible to others.

---

## 1. Seed Data (Git-tracked Baseline)

### Stored In

- `data/project-data.js` — committed to the git repository

### Contains

- Project metadata (name, areas, seed version)
- The initial/baseline backlog of tasks
- The docs index (which files appear in the Docs tab)
- The skills index (which skill files appear in the Skills section)

### Sync Behaviour

- Anyone who clones or copies the repo gets this data
- Changes require editing `data/project-data.js` and committing
- These are the "official" tasks — the source of truth for the project baseline

---

## 2. Browser Local State (Per-machine, Per-browser)

### Stored In

- `localStorage` in the user's browser
- Storage key: `ltm-task-tracker-v1`

### Contains

- All tasks created or edited in the browser UI after the initial load
- UI preferences: collapsed board columns (`ui.collapsedColumns`), list sort (`ui.listSort`)
- Custom property names (`ui.propLabels`) — renamed labels for Urgency, Value, Area, etc.
- Confirm-dialog preferences (e.g. `lbm_skipDeleteConfirm`)
- The editable project title (if changed via the header)

### Sync Behaviour

- Completely local to that browser on that machine
- Not committed to git automatically
- Not shared across devices or users
- Survives page refreshes within the same browser
- Lost if the user clears browser data or opens the app in a different browser

---

## What Happens on First Load

When a user opens `index.html` for the first time in a new browser:

1. No `localStorage` data exists yet
2. The app reads `data/project-data.js` and loads the seed tasks
3. From that point on, changes are saved to `localStorage`

The seed data is **only loaded once** per browser (on first run or after a reset).

---

## Resetting

To wipe local changes and reload from the git-tracked baseline:

1. Click the **ⓘ** info button in the app header
2. Click **Reset**
3. Choose what to reset using the toggles:
   - **Clear all entries** — removes all entries from `localStorage` and reloads seed data from `data/project-data.js`
   - **Reset workspace name** — clears the custom project/workspace name set via the header
   - **Reset settings** — resets theme and other display preferences to defaults

Each option is independent — you can clear entries without touching the workspace name or settings, and vice versa.

---

## Sharing Changes Across Machines

Because browser state is local, sharing requires an explicit step:

| Goal | How |
|---|---|
| Share a task with a teammate | Export JSON → send the file → they import it |
| Make a task permanent for all users | Edit `data/project-data.js` and commit |
| Back up your local work | Export JSON or Markdown from the ⓘ info panel |

---

---

## 3. Automatic Restore Points

Restore points are rolling snapshots of your task data, created automatically in the background. They give you a safety net to recover from accidental deletes, bulk lane moves, or any other change you didn't mean to make.

### What's stored

Each restore point captures:
- A deep copy of all tasks at that moment
- The number of tasks (shown in the list for quick orientation)
- The timestamp when the snapshot was taken

View preferences (sort order, column layout, filters) are **not** stored — restoring a point never resets your UI settings.

### When snapshots are created

Snapshots are created automatically — you never need to trigger them manually:

- **During active use** — after any task change, a snapshot is queued. It fires 1.5 seconds after the last change, but only if at least 30 minutes have passed since the previous snapshot. This prevents flooding storage during bulk edits.
- **At session boundaries** — whenever you switch tabs, minimize the window, or close the browser, a snapshot is taken immediately (bypassing the 30-minute gate). This ensures you always have a recent point to return to.

### Storage

- Stored in `localStorage` under `<STORAGE_KEY>-snapshots`
- Maximum **25 snapshots** are kept. When the 26th is added, the oldest is dropped (FIFO).
- Stored in the same browser as your task data. Cleared if the user clears browser storage.

### Using restore points

1. Open the **three-dot app menu** (top-right)
2. Click **Restore points**
3. Browse the list (newest first). Each row shows the label, relative timestamp, and task count.
4. Click **Revert** on any row — the button changes to **Confirm?** (amber).
5. Click **Confirm?** within 4 seconds to execute the revert, or wait for it to reset.

After reverting, an **Undo** banner appears at the bottom of the screen. Click it to immediately undo the revert. The app also automatically saves a **"Before revert"** snapshot before applying the restore, so the undo is always available in the list even after the banner disappears.

---

## Practical Summary

> Add tasks in the browser for personal working notes.  
> Commit changes to `data/project-data.js` when a task should be visible to everyone who opens the app fresh.  
> Use **Restore points** (app menu) to recover from accidental changes without needing to export/import.
