# Setup Guide

This guide gets you from zero to a working Local Business Manager in under two minutes. Choose the path that fits you best.

---

## What You Need

Just a web browser — Chrome, Firefox, Safari, or Edge. That is it.

No Node.js. No npm. No installation. No sign-up.

---

## Drop LBM into Any Project

LBM is a self-contained folder. No build step, no dependencies, no accounts.

**To use it for a new project:**

1. Copy the entire `1_LBM_Local_Business_Manager` folder into your project (or anywhere on your computer)
2. Open `index.html` in your browser
3. **Click the project name in the header** to rename it inline — no file editing needed
4. Click **ⓘ** in the header → find **Storage key** at the bottom → click **Change** → type a unique name for this project → **Save & reload**
5. Once reloaded, click **ⓘ** again → **Reset to Seed** to start from a clean slate

That's it. Your tracker is now isolated from any other LBM instance and ready to use.

> **Why set a unique storage key?** If you have two copies of LBM open in the same browser, they share `localStorage` — meaning their tasks can bleed into each other. Giving each copy its own key keeps them completely isolated. The app remembers your choice per folder path, so you only need to set it once.
>
> **Why reset?** Resetting loads cleanly from the seed data in `data/project-data.js`. An undo banner appears immediately so you can reverse if needed.

---

## Installation

### If You Are Not a Developer

**Step 1 — Download the project**

Go to the GitHub page for this project. Click the green **Code** button, then click **Download ZIP**.

> If someone sent you a folder or zip file directly, skip to Step 2.

**Step 2 — Unzip the folder**

Find the downloaded file in your `Downloads` folder. Double-click it to unzip. You will get a folder called `1_LBM_Local_Business_Manager`.

Move it anywhere you like — your Desktop, Documents, wherever is convenient.

**Step 3 — Open the app**

Open the folder. Find the file called `index.html`. Double-click it.

```
📁 1_LBM_Local_Business_Manager
    └── 📄 index.html  ← double-click this
```

Your browser will open and the app loads immediately. You will see sample tasks already in place so you can explore right away.

**Done.** Nothing else to install.

---

### If You Are a Developer

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

---

## The Docs Tab

The **Docs** tab in the navigation header opens a documentation viewer with all the built-in guides.

> **If the Docs tab shows blank or broken content**, your browser is blocking local file reads. This is a browser security rule, not a bug in the app.
>
> **Fix:** Open a Terminal window, navigate into the folder, and run:
> ```bash
> python3 -m http.server 8080
> ```
> Then open `http://localhost:8080` in your browser. The Docs tab will work correctly.
>
> You only need to do this if you use the Docs tab. The task tracker itself works fine when opened directly.

---

## Customise the Project Name

**Quickest way — no file editing needed:**

Click the project name in the app header. It becomes editable inline. Type your new name and press Enter (or click away). The name saves to your browser immediately.

**To bake the name into the git-tracked file** (so others who clone the repo also see it):

Open `data/project-data.js` in any text editor (Notepad, TextEdit, VS Code — anything works).

Find this section near the top and update it:

```js
project: {
  name: "LBM",                        // ← short name in the header
  fullName: "Local Business Manager", // ← full name for display
  maintainedBy: "Your Name",          // ← your name
},
```

Save the file and refresh your browser. The header updates immediately.

---

## Customise Your Working Areas

Still in `data/project-data.js`, find the `areas` array and replace it with your own categories:

```js
areas: [
  "design",
  "development",
  "marketing",
  "operations"
],
```

These appear as filter options in the task list.

---

## Rename Property Labels

Property names like **Urgency**, **Value**, and **Area** can be renamed to match your workflow — no code editing required.

Click any property label in the task detail panel — it becomes editable inline. Type your new name and press Enter. The change saves automatically and updates everywhere: the Sort menu, the Settings panel, and the detail panel itself.

Your custom labels are stored in your browser and persist across sessions.

---

## Set Your Starting Tasks

The `tasks` array in `data/project-data.js` contains the default tasks loaded when someone opens the app for the first time.

Replace the sample tasks with your own backlog, or clear it for a blank start:

```js
tasks: []
```

> **What is seed data?** Seed tasks are the git-committed baseline. Tasks you create in the browser are saved to `localStorage` and stay personal to that browser. See [Persistence and State](docs.html?doc=docs/PERSISTENCE_AND_STATE.md) for the full explanation.

---

## Backing Up Your Tasks

Your tasks are saved automatically in your browser. To export them as a file:

1. Click the **ⓘ** (info) icon in the app header
2. Choose **Export JSON** or **Export Markdown**

Keep this file somewhere safe if you want a permanent record.

---

## Starting Fresh / Reset to Seed

To wipe your browser's local changes and go back to the seed data:

1. Click the **ⓘ** (info) icon in the app header
2. Click **Reset to Seed**

This restores all tasks to the values in `data/project-data.js`.

**You will not lose your work without a chance to recover it.** An undo banner appears immediately after the reset. Click it to restore your previous state — it remains available until you navigate away or close the tab.

This makes reset safe to use confidently:
- Starting a new project with LBM? Reset after editing `project-data.js` — your custom seed loads cleanly.
- Shared the folder with a new team member? They open it fresh and get the seed data automatically.
- Want a clean slate for a new sprint? Reset, then the seed is your new baseline.

---

## Giving It to Someone Else

LBM is designed to be handed off with zero friction:

1. Make sure `data/project-data.js` has the right seed tasks and areas committed to git
2. Zip the folder and send it (or share the GitHub link)
3. They open `index.html` — done immediately

New users always start from the seed data the first time they open the app.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Docs tab is blank or broken** | Serve with `python3 -m http.server 8080` and visit `http://localhost:8080` |
| **My tasks disappeared** | Tasks live in `localStorage`. Check you're using the same browser and haven't cleared browsing data. |
| **The header shows the wrong name** | Update `data/project-data.js` and refresh |
| **I want to start over** | Click **ⓘ** in the header and choose **Reset to Seed** |
| **I opened it in the wrong browser** | Tasks are browser-specific — open `index.html` in the same browser you used before |
