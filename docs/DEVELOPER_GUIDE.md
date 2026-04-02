# Developer Guide

How to deploy, embed, and extend the Local Business Manager in any project — without a build step, without a terminal, and without a package manager.

---

## Deployment: Copy and Run

LBM is a self-contained folder. It has no build step, no dependencies, and no compilation.

1. Copy the entire `1_LBM_Local_Business_Manager` folder into your project (or anywhere on your computer)
2. Open `index.html` in a browser
3. Done — the app runs immediately

There is nothing to install, compile, or configure before it works.

> **The OS folder name does not matter.** Rename the folder to `tracker/`, `lbm/`, `_task-manager/`, or anything else — the app reads its configuration from `data/project-data.js`, not from the folder name on disk.

---

## Rename the Project (No Terminal, No File Editing)

**Click the project name in the header.** It becomes editable inline. Type your new name and press Enter (or click away to save).

The name saves to your browser automatically and persists across sessions on that machine.

This is the fastest way to rename a fresh copy of LBM — no files to edit, no terminal required.

> **Want the name in the git-tracked seed file too?** Update `project.name` and `project.fullName` in `data/project-data.js`. This ensures that anyone else who clones the repo and opens it fresh also sees your project name.

---

## The Storage Key — Avoid Data Collisions

LBM stores all task data in your browser's `localStorage` under a namespaced key. If two copies of LBM are open in the same browser with the same key, they will share task data — tasks from one project will appear in the other.

**Fix (no file editing required):**

1. Open the app and click **ⓘ** in the header
2. At the bottom of the info panel, find **Storage key**
3. Click **Change**, type a unique name for this project (e.g. `my-project-tracker`), then **Save & reload**

The app migrates all existing data to the new key and reloads. Both the key choice and data isolation are stored per-folder-path, so each copy of LBM on your machine remembers its own key independently.

**To also bake the key into the git-tracked file** (so clones start with the right key by default), update `tracker.storageKey` in `data/project-data.js`:

```js
tracker: {
  storageKey: "my-project-name-tracker",   // ← set once per project
```

> **How isolation works under the hood:** `header.js` stores your chosen key at `lbm-path-key:{page-path}` in localStorage — a meta key that's unique to this folder's location on disk. On every page load, `header.js` reads this meta key and patches `window.MCCProjectData.tracker.storageKey` before `task-app.js` runs, so the right key is always used without you having to do anything after the first setup.

---

## Embedding LBM Inside a Larger Project

LBM is pure HTML, CSS, and vanilla JavaScript — no modules, no imports, no JSX. If you drop it inside a project that uses a build tool (webpack, Vite, Next.js, etc.), the build tool may try to process LBM's files.

### Vite

Place LBM outside your `src/` directory. Vite only processes files inside `src/` by default — anything outside is left untouched. Access LBM by opening `lbm/index.html` directly in your browser.

If you need it inside `src/`, exclude it in your config:

```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      external: [/lbm\/.*/]
    }
  }
}
```

### webpack

Add the folder to the `exclude` rule in your loader config:

```js
// webpack.config.js
{
  test: /\.js$/,
  exclude: [/node_modules/, /lbm/],
  use: 'babel-loader'
}
```

### Next.js

Place LBM in the `/public` folder. Next.js serves everything in `/public` as static files without processing them. Access LBM at `http://localhost:3000/lbm/index.html`.

### No build tool

Open `index.html` directly in your browser — no server needed. The only exception is the Docs tab, which requires a local server due to browser security rules around local file reads. See the [Setup Guide](docs.html?doc=docs/SETUP_GUIDE.md) for details.

---

## .gitignore

LBM generates no build output and requires no local-only config files. There is nothing LBM-specific to add to `.gitignore`.

All task data lives in the browser's `localStorage` — it is never written to disk and will never accidentally appear in a git diff.

```gitignore
# Nothing LBM-specific needs to be gitignored.
# Task state lives in the browser's localStorage, not in any file.
```

If you are embedding LBM in a larger project that has a build system, you may want to note in your `.gitignore` or README that the LBM folder should be excluded from the build.

---

## File Map

```
1_LBM_Local_Business_Manager/
├── index.html             ← main app (List + Board views)
├── docs.html              ← documentation viewer
├── resources.html         ← resource/asset index
├── styles.css             ← all styles (dark theme, design tokens)
├── task-app.js            ← list + board + detail panel logic
├── docs-app.js            ← docs viewer logic
├── header.js              ← shared header + nav (project rename lives here)
├── data/
│   ├── project-data.js    ← seed tasks, docs index, areas config ← start here
│   └── docs-content.js    ← pre-rendered doc cache (must stay in sync!)
├── docs/                  ← all documentation (markdown)
├── CLAUDE.md              ← AI session bootstrap (auto-loaded by Claude Code)
├── SKILL.md               ← feature development reference
├── SKILL_ADD_SHORTCUT.md  ← keyboard shortcut guide
└── DESIGN_SKILL.md        ← CSS and UI design reference
```

**Key rules for developers:**
- **Vanilla JS + HTML/CSS only** — no build step, no npm, no compilation
- **Local-first** — all task state lives in `localStorage`; `data/project-data.js` is the git-committed baseline
- **`docs-content.js` is a cache** — always update it when you change any `.md` doc file; the Docs tab reads from this cache, not from the raw markdown files

---

## Adding to This Project

| Task | Reference |
|---|---|
| Add a feature | [SKILL.md](docs.html?doc=SKILL.md) |
| Add a keyboard shortcut | [SKILL_ADD_SHORTCUT.md](docs.html?doc=SKILL_ADD_SHORTCUT.md) |
| CSS or UI work | [DESIGN_SKILL.md](docs.html?doc=DESIGN_SKILL.md) |
| Work with Claude Code | [AI Development Guide](docs.html?doc=docs/AI_DEVELOPMENT_GUIDE.md) |
| Add a task via AI | [AI Task Creation](docs.html?doc=docs/AI_TASK_CREATION.md) |

---

## Documentation Rule

When adding or updating documentation in this project (applies to all developers and AI assistants):

1. **Check first.** Does a relevant doc file already exist? If yes, update it — do not create a duplicate file.
2. **If no file exists,** create it in `docs/`.
3. **Always sync the cache.** After any doc change, update the matching entry in `data/docs-content.js`. If the doc is new, add a new entry.
4. **Register new docs in `project-data.js`.** New docs must be added to the `docs` array so they appear in the Docs tab inside the app.

This keeps the documentation system consistent and prevents stale content in the in-app viewer.
