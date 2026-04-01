# Setup Guide

This guide gets you from zero to a working Local Business Manager installation in under five minutes — no command line required.

---

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A text editor if you want to customise the project name or seed tasks (VS Code, Notepad, TextEdit — anything works)

That is it. No Node.js, no npm, no installation.

---

## Step 1 — Get the Files

**Option A: Copy the folder**
Copy the entire `1_LBM_Local_Business_Manager/` folder into your own project directory or anywhere on your computer.

**Option B: Clone from Git**
```bash
git clone <repo-url>
```

**Option C: Download as ZIP**
Download the repository as a ZIP file from GitHub and extract it anywhere.

---

## Step 2 — Open the App

Navigate into the folder and double-click `index.html` to open it in your browser.

```
1_LBM_Local_Business_Manager/
└── index.html   ← open this
```

The app loads instantly with sample tasks already populated so you can see how it works.

> **Tip:** If doc files in the Docs tab fail to load, serve the folder with a local server instead:
> ```bash
> cd 1_LBM_Local_Business_Manager
> python3 -m http.server 8080
> ```
> Then open `http://localhost:8080` in your browser.

---

## Step 3 — Customise the Project Name

Open `data/project-data.js` in a text editor and update the top section:

```js
window.MCCProjectData = {
  project: {
    name: "LBM",                        // ← short name shown in the header
    fullName: "Local Business Manager", // ← full name for display
    maintainedBy: "Your Name",
    ...
  },
```

Save the file and refresh your browser. The header title updates immediately.

---

## Step 4 — Define Your Working Areas

Still in `data/project-data.js`, find the `areas` array and replace the defaults with your own categories:

```js
areas: [
  "design",
  "development",
  "marketing",
  "operations"
],
```

These areas appear as filter options in the task list.

---

## Step 5 — Set Your Seed Tasks

The `tasks` array in `data/project-data.js` contains the default tasks loaded when someone opens the app for the first time (or after a reset).

Replace the sample tasks with your own starting backlog, or clear the array entirely for a blank slate:

```js
tasks: []
```

> **What is seed data?** Seed tasks are the git-committed baseline. Tasks you create in the browser UI are saved to `localStorage` and are personal to that browser. See [Persistence and State](PERSISTENCE_AND_STATE.md) for the full explanation.

---

## Step 6 — Open the Docs Tab

Click the **Docs** tab in the header navigation to read the included guides:

- **Vision and Philosophy** — the "why" behind the project
- **Persistence and State** — where your data lives
- **Keyboard Shortcuts** — power-user shortcuts for navigating the app
- **Local Project System** — how to keep tasks and docs in sync with your codebase

---

## Resetting to Seed Data

If you want to wipe your browser's local changes and start fresh from the seed data:

1. Click the **ⓘ** (info) icon in the app header
2. Click **Reset to Seed**

This restores all tasks to the values in `data/project-data.js`.

---

## Exporting Your Tasks

To back up or share your current task list:

1. Open the **ⓘ** info panel
2. Click **Export JSON** or **Export Markdown**

The exported file includes all tasks in your current browser session.

---

## Handing Off to a New User

When giving this app to someone else:

1. Make sure `data/project-data.js` has the correct seed tasks and areas committed to git
2. Tell them to open `index.html` in their browser
3. Point them to this guide and the [Docs tab](../docs.html) for further reading

New users always start from the seed data the first time they open the app in their browser.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Docs tab shows empty or broken content | Serve with `python3 -m http.server 8080` instead of opening the file directly |
| My tasks disappeared | Check if you opened the file in a different browser or cleared browser data. Tasks live in `localStorage`. |
| Header shows wrong project name | Update `data/project-data.js` and refresh |
| I want to start fresh | Use the **Reset to Seed** button in the ⓘ info panel |
