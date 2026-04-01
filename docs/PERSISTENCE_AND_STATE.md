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

## Resetting to Seed

To wipe local changes and reload from the git-tracked baseline:

1. Click the **ⓘ** info button in the app header
2. Click **Reset to Seed**

This clears the `localStorage` task data and reloads the seed tasks from `data/project-data.js`.

---

## Sharing Changes Across Machines

Because browser state is local, sharing requires an explicit step:

| Goal | How |
|---|---|
| Share a task with a teammate | Export JSON → send the file → they import it |
| Make a task permanent for all users | Edit `data/project-data.js` and commit |
| Back up your local work | Export JSON or Markdown from the ⓘ info panel |

---

## Practical Summary

> Add tasks in the browser for personal working notes.  
> Commit changes to `data/project-data.js` when a task should be visible to everyone who opens the app fresh.
