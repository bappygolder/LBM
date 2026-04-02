# Local Business Manager (LBM)

**LBM** is a free, open-source task and project tracker that runs in your web browser. No sign-up. No subscription. No internet connection needed. Download it once and it works.

![LBM — List View](resources/screenshot-app.png)

---

## What Is It?

Think of it like a personal Notion or Trello — but it lives on your computer, not on someone else's server. You get:

- A **task list** to manage everything you're working on
- A **board view** (Kanban-style) to visualise your workflow
- A **docs hub** for keeping guides and notes alongside your tasks
- **Full ownership** of your data — it never leaves your machine

---

## Drop It Into Any Project

LBM is a folder. Copy it anywhere, name it, and you're running.

1. Copy the `1_LBM_Local_Business_Manager` folder into your project (or Desktop, or anywhere)
2. Open `index.html` in your browser
3. **Click the project name in the header** to rename it inline — no file editing needed
4. Click **ⓘ** in the header → **Reset to Seed**

Done. The reset clears any leftover browser data from a previous project and loads cleanly. An undo banner appears immediately so you can reverse it if needed.

> No account. No API key. No cloud service. The folder works on every machine, in every browser, offline.

**The OS folder name does not affect the app.** Rename the folder to anything — `tracker/`, `lbm/`, `_tasks/` — it makes no difference.

**Multiple copies in the same browser?** Click **ⓘ** in the header → **Storage key** → **Change** — give each copy a unique key. The app handles data migration and remembers your choice. See the [Developer Guide](docs.html?doc=docs/DEVELOPER_GUIDE.md) for details.

---

## Install in 2 Minutes

Choose the path that fits you best.

---

### For Everyone (No Technical Skills Required)

**Step 1 — Download the project**

Go to the GitHub page for this project. Click the green **Code** button, then click **Download ZIP**.

> If you were sent a zip file directly, skip to Step 2.

**Step 2 — Unzip and move the folder**

Find the downloaded ZIP file (usually in your `Downloads` folder). Double-click it to unzip, then drag the folder to your Desktop or anywhere you like.

**Step 3 — Open the app**

Open the folder. Inside you will see a file called **`index.html`**. Double-click it.

```
📁 1_LBM_Local_Business_Manager
    └── 📄 index.html  ← double-click this
```

Your browser opens and the app loads instantly. Sample tasks are already there so you can see how everything works.

**That is it.** No installation. No account. Just open and use.

> **Having trouble with the Docs tab?** If the Docs section shows blank pages, you need to serve the folder through a simple local web server. See the [Troubleshooting](#troubleshooting) section below — it takes 30 seconds.

---

### For Developers

```bash
git clone <repo-url>
cd 1_LBM_Local_Business_Manager
open index.html
```

Or serve it locally to avoid CORS issues with the Docs tab:

```bash
python3 -m http.server 8080
# Then open http://localhost:8080
```

No npm. No build step. No dependencies. Just open the file.

**Embedding LBM inside a larger project?** If your project uses a build tool (Vite, webpack, Next.js, etc.), keep LBM outside your `src/` folder so the build tool does not process it. For Next.js, drop it in `/public`. Full guidance: [Developer Guide](docs.html?doc=docs/DEVELOPER_GUIDE.md).

---

## What You'll See

When you open the app for the first time, it comes pre-loaded with sample tasks so you can explore right away:

- **Actions tab** — your task list and board view
- **Docs tab** — all the guides for using and customising the app
- **Resources tab** — a place to keep links and reference material

---

## Making It Your Own

**Rename properties directly in the app** — click any property label (Urgency, Value, Area, etc.) in the task detail panel to rename it inline. The new name saves automatically and updates everywhere: the Sort menu, the Settings panel, and all views.

**Deeper customisation** lives in one file: [data/project-data.js](data/project-data.js)

Open it in any text editor (Notepad, TextEdit, VS Code — anything works) and update these fields:

```js
project: {
  name: "LBM",                        // ← short name shown in the header
  fullName: "Local Business Manager", // ← full name
  maintainedBy: "Your Name",          // ← your name
},
```

Save the file, refresh your browser. Done.

**Full customisation walkthrough:** [Setup Guide](docs.html?doc=docs/SETUP_GUIDE.md)

---

## Your Data

Your tasks are saved automatically as you work. They are stored in your **browser's local storage** — on your computer, not in the cloud.

- **Closing the tab** is fine — your tasks are still there when you come back
- **Different browsers** have separate data — Chrome and Firefox won't share tasks
- **Clearing browser data** will erase your tasks — export first if needed

To back up your tasks: click the **ⓘ** icon in the app header and choose **Export JSON** or **Export Markdown**.

---

## Sharing With Your Team

LBM is designed to be handed to someone else with zero friction:

1. Make sure your tasks and settings are saved in `data/project-data.js`
2. Zip the folder and send it (or push to GitHub)
3. They open `index.html` — they're up and running immediately

New users always start from the tasks and configuration in `data/project-data.js`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Docs tab shows blank pages** | The browser is blocking local file reads. Open Terminal, run `cd` into the folder, then `python3 -m http.server 8080`, and visit `http://localhost:8080` |
| **My tasks disappeared** | Tasks live in your browser's local storage. Check that you're using the same browser and haven't cleared browsing data. |
| **The header shows the wrong project name** | Edit `data/project-data.js` and change the `name` and `fullName` fields, then refresh |
| **I want to start from a clean slate** | Click the **ⓘ** icon in the header and choose **Reset to Seed** — an undo banner appears immediately so you can restore if needed |

---

## Documentation

All guides are available inside the app under the **Docs** tab, and as plain files in the [docs/](docs/) folder.

| Guide | What it covers |
|---|---|
| [About](docs.html?doc=docs/ABOUT.md) | What LBM is, who it's for, and the vision behind it |
| [Setup Guide](docs.html?doc=docs/SETUP_GUIDE.md) | Step-by-step setup and customisation — developer and non-developer paths |
| [Vision and Philosophy](docs.html?doc=docs/VISION_AND_PHILOSOPHY.md) | The three-tier product roadmap and "everything in a box" philosophy |
| [Persistence and State](docs.html?doc=docs/PERSISTENCE_AND_STATE.md) | Where your data lives and how local storage works |
| [Keyboard Shortcuts](docs.html?doc=docs/KEYBOARD_SHORTCUTS.md) | All power-user shortcuts |
| [Local Project System](docs.html?doc=docs/LOCAL_PROJECT_SYSTEM.md) | How the tracker, docs, and seed data work together |
| [Developer Guide](docs.html?doc=docs/DEVELOPER_GUIDE.md) | Portability, embedding in projects, build exclusion, storage key, and the documentation rule |
| [AI Development Guide](docs.html?doc=docs/AI_DEVELOPMENT_GUIDE.md) | Working with Claude Code to extend the app |

---

## For Developers — File Map

```
1_LBM_Local_Business_Manager/
├── index.html             ← main app (List + Board views)
├── docs.html              ← documentation viewer
├── resources.html         ← resource/asset index
├── styles.css             ← all styles (dark theme, design tokens)
├── task-app.js            ← list + board + detail panel logic
├── docs-app.js            ← docs viewer logic
├── header.js              ← shared header + nav
├── data/
│   ├── project-data.js    ← seed tasks, docs index, areas config
│   └── docs-content.js    ← pre-rendered doc cache (keep in sync!)
├── docs/                  ← documentation
│   ├── ABOUT.md               ← project overview
│   ├── SETUP_GUIDE.md         ← first-time user guide
│   ├── AI_DEVELOPMENT_GUIDE.md← working with Claude Code
│   ├── KEYBOARD_SHORTCUTS.md  ← all keyboard shortcuts
│   ├── PERSISTENCE_AND_STATE.md← where data lives
│   ├── LOCAL_PROJECT_SYSTEM.md ← tracker + docs workflow
│   └── VISION_AND_PHILOSOPHY.md← three-tier product vision
├── CLAUDE.md              ← AI session bootstrap (auto-loaded by Claude Code)
├── SKILL.md               ← feature development reference
├── SKILL_ADD_SHORTCUT.md  ← keyboard shortcut implementation guide
└── DESIGN_SKILL.md        ← CSS and UI design reference
```

**Key rules:**
- **Vanilla JS + HTML/CSS only** — no build step, no npm, no compilation
- **Local-first** — all task state lives in `localStorage`; `data/project-data.js` is the git-tracked baseline
- **`docs-content.js` is a cache** — always update it when you change a `.md` doc file
- **Property labels sync everywhere** — `propLabels` in `localStorage` is the single source of truth; rename in the detail panel and it propagates to sort, settings, and all views automatically
- **Documentation rule** — always check if a doc file already exists before creating a new one; update existing files rather than creating duplicates

**Full developer reference:** [Developer Guide](docs.html?doc=docs/DEVELOPER_GUIDE.md)  
**Adding features:** [SKILL.md](docs.html?doc=SKILL.md)  
**Design and CSS:** [DESIGN_SKILL.md](docs.html?doc=DESIGN_SKILL.md)  
**Working with Claude Code:** [AI Development Guide](docs.html?doc=docs/AI_DEVELOPMENT_GUIDE.md)

---

## The Vision

LBM is the free, open-source foundation of a three-part product vision:

| Tier | Name | Status |
|---|---|---|
| 1 | **LBM** — Local Business Manager | Free / Open Source |
| 2 | **OBM** — Online Business Manager | Freemium SaaS *(planned)* |
| 3 | **Business in a Box** | Premium agency rollout *(planned)* |

Read the full story: [Vision and Philosophy](docs.html?doc=docs/VISION_AND_PHILOSOPHY.md)
