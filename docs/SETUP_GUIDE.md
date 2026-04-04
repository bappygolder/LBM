# Setup Guide

Get from zero to a working Local Business Manager in under two minutes.

> **New here?** [About LBM →](docs.html?doc=docs/ABOUT.md) explains what it is, who it's for, and the philosophy behind it.

---

## 1. Open the app

Copy the `1_LBM_Local_Business_Manager` folder anywhere. Open `index.html` in your browser.

You will see sample tasks immediately — no installation, no sign-up, no build step.

---

## 2. Name this copy

If you have used LBM in this browser before, a setup dialog will appear automatically asking you to name this copy. Type a short name for your project (e.g. `My Shop 2026`) and click **Start Fresh**.

This keeps each copy's tasks completely separate. LBM generates a unique storage key behind the scenes — you never need to touch it unless you want to.

> If no dialog appears, this is your first copy in this browser and you are ready to go.

---

## 3. Add your first task

Press **N** (or click the **+** button) to open the new task form. Type a title, set the urgency and value sliders, then press **Enter** or click **Add Task**.

Tasks are organized into lanes: Backlog → In Progress → Completed. Drag to move, or use the lane selector in the detail panel.

---

## 4. Your work is saved automatically

Tasks live in your browser's `localStorage` — no server, no account. They persist between sessions automatically.

To back up your data: click the **ⓘ** icon in the header → **Export JSON**. Keep the file somewhere safe.

---

## Advanced Configuration

### Rename the project

Click the project name in the header. It becomes editable inline. Press **Enter** to save. This stores the name in your browser only.

To bake the name into the git-tracked file (so teammates see it too), edit `data/project-data.js`:

```js
project: {
  name: "LBM",                        // ← short name in the header
  fullName: "Local Business Manager", // ← full name for display
  maintainedBy: "Your Name",
},
```

### Customise working areas

In `data/project-data.js`, update the `areas` array with your own categories:

```js
areas: [
  "design",
  "development",
  "marketing",
  "operations"
],
```

These appear as filter options in the task list.

### Rename property labels

Click any property label in the task detail panel (Urgency, Value, Area) — it becomes editable inline. Changes save automatically and update everywhere.

### Set starting tasks

The `tasks` array in `data/project-data.js` contains tasks loaded on first open. Replace with your own backlog or clear it:

```js
tasks: []
```

> **Seed data explained:** Tasks from `project-data.js` are the git-committed baseline. Tasks you create in the browser are saved to `localStorage` and stay personal to that browser. See [Persistence and State](docs.html?doc=docs/PERSISTENCE_AND_STATE.md) for details.

### Developer setup

```bash
git clone <repo-url>
cd 1_LBM_Local_Business_Manager
open index.html
```

To avoid CORS issues with the Docs tab, serve locally:

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

### Docs tab showing blank content?

Your browser is blocking local file reads. Fix: run `python3 -m http.server 8080` from the project folder and open `http://localhost:8080`. You only need this if you use the Docs tab.

### Manage the storage key manually

If you skipped the setup dialog, you can set the storage key yourself:

- Click **ⓘ** in the header → **Storage key** → **Change**
- Type a short unique name, e.g. `my-shop-2026`
- Click **Save & reload**

Each copy of LBM in the same browser needs a different key. LBM remembers your choice per folder path, so you only do this once.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Docs tab is blank or broken** | Serve with `python3 -m http.server 8080` and visit `http://localhost:8080` |
| **My entries disappeared** | Entries live in `localStorage`. Check you are using the same browser and have not cleared browsing data. |
| **The header shows the wrong name** | Update `data/project-data.js` and refresh |
| **I want to start over** | Click the **ⓘ** icon → **Reset** → choose what to clear |
| **I opened it in the wrong browser** | Entries are browser-specific — open `index.html` in the same browser you used before |
| **Two copies are showing the same entries** | Each copy needs a unique storage key. Click **ⓘ** → **Storage key** → **Change** and set a different name in each copy. |
