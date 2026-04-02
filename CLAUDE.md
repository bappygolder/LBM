# CLAUDE.md — Local Business Manager (LBM) v1

This file is loaded automatically when this folder is open as a workspace in Claude Code. Read it before responding to any request.

---

## WHAT THIS IS

The **Local Business Manager (LBM)** is a self-contained, browser-based task tracker. It is designed to be a standalone project — open this folder directly in Claude Code and it works independently.

This is **v1** — a self-contained snapshot with sample tasks and full documentation included.

---

## FILE MAP

```
Local Business Manager/
├── CLAUDE.md                  ← you are here (session bootstrap)
├── SKILL.md                   ← how to develop and extend the LBM
├── SKILL_ADD_SHORTCUT.md      ← use this when adding any keyboard shortcut
├── SKILL_ADD_TASK.md          ← how to create tasks via Claude (AI task creation)
├── DESIGN_SKILL.md            ← design reference (read before any CSS/UI work)
├── CLAUDE_INTEGRATION_GUIDE.md ← how to use LBM alongside other dev projects
├── PHASES.md                  ← phase handover guide with staged prompts
├── README.md                  ← setup + usage guide
├── index.html             ← main app (List + Board views)
├── docs.html              ← documentation viewer
├── resources.html         ← resource index (logos, assets)
├── styles.css             ← all styles for every page
├── task-app.js            ← list + board + detail panel logic
├── docs-app.js            ← docs viewer logic
├── data/docs-content.js        ← pre-rendered doc content cache
├── data/project-data.js        ← seed tasks, docs index, areas config
├── docs/                  ← LBM documentation
│   ├── LOCAL_PROJECT_SYSTEM.md    ← tracker workflow guide
│   ├── PERSISTENCE_AND_STATE.md  ← data storage reference
│   ├── AI_TASK_CREATION.md       ← AI + console API task creation guide
│   └── VOICE_COMMANDS.md         ← voice input guide
└── resources/             ← design assets
    └── README.md          ← how to add/manage resources
```

---

## ADDING TASKS VIA AI

**Read `SKILL_ADD_TASK.md`** when the user says any of:
- "Add this to the task board"
- "Add to LBM: [description]"
- "Create a task for X"
- "Log this as a task"
- "Track this in LBM"
- "Make a task: X" / "LBM task: X"
- "Put this on the board"

The skill file tells you how to infer urgency/value/area from natural language and generate a `window.LBM.addTask({...})` browser console command.

**Public API** (available in LBM browser console whenever `index.html` is open):
- `window.LBM.addTask(taskObj)` — add a task; all fields optional except `title`
- `window.LBM.getTasks()` — return a snapshot of all current tasks

For using LBM alongside a different project (log tasks without switching workspaces), read `CLAUDE_INTEGRATION_GUIDE.md`.

---

## ADDING KEYBOARD SHORTCUTS

**Always read `SKILL_ADD_SHORTCUT.md` before adding any shortcut.** Every shortcut must be registered in 5 locations:
1. `task-app.js` — key handler logic
2. `styles.css` — any new UI styles
3. `index.html` — shortcuts panel row
4. `docs/KEYBOARD_SHORTCUTS.md` — user docs
5. `data/docs-content.js` — pre-rendered cache

---

## DESIGN SKILL

**Read `DESIGN_SKILL.md` before doing any of the following:**
- Writing or editing CSS in `styles.css`
- Adding or modifying a component's HTML structure
- Choosing colors, spacing values, font sizes, or border radii
- Adding new animations or transitions
- Creating a new UI pattern without an existing precedent

`DESIGN_SKILL.md` is the canonical reference for all visual decisions. It documents the type scale, spacing grid, color system, component patterns, motion rules, and accessibility requirements — drawn from Linear, shadcn/ui, Material Design 3, and Apple HIG, adapted to this project.

When in doubt: check the **Improvement Checklist** (Section 10) before finishing any UI work.

---

## KEY DESIGN RULES

- **Vanilla JS + HTML/CSS only** — no build step, no npm. Open `index.html` in a browser.
- **Local-first** — all task state lives in `localStorage`. The seed data in `data/project-data.js` is the git-tracked baseline.
- **Storage key isolation** — each copy of LBM uses a namespaced localStorage key (`tracker.storageKey` in `project-data.js`). The user can change this from the UI: **ⓘ → Storage key → Change**. The choice is persisted at `lbm-path-key:{page-path}` — a meta key unique to the folder's location on disk. `header.js` reads this on every load and patches `window.MCCProjectData.tracker.storageKey` before `task-app.js` runs, so `STORAGE_KEY` is always correct. Do not rename or remove this mechanism.
- **Notes field** — `task.notes` is plain text (preview). `task.body` is HTML (rich text from the detail panel editor).
- **Lane system** — `processing` and `on-hold` are separate lane values but display under the same "Processing / On Hold" board column.
- **Board collapse** — collapsed columns are stored in `localStorage` under `ui.collapsedColumns`. They render as vertical strips on the right side of the board.
- **Resources** — files in `resources/` are tracked in git but excluded from any app build process.

---

## ACTIVE LANES

| Lane key | Display label | Active? |
|---|---|---|
| `newly-added-or-updated` | Newly Added or Updated | ✓ |
| `backlog` | Backlog | ✓ |
| `processing` | Processing / On Hold | ✓ |
| `on-hold` | Processing / On Hold | ✓ |
| `in-progress` | In Progress | ✓ |
| `completed` | Completed | — |
| `archived` | Archive | — |

---

## RECOMMENDED MODEL FOR THIS PROJECT

| Task | Model |
|---|---|
| Adding features, refactoring JS | Sonnet 4.6 (`claude-sonnet-4-6`) |
| Architecture decisions, big rewrites | Opus 4.6 (`claude-opus-4-6`) |
| Small edits, CSS tweaks | Haiku 4.5 (`claude-haiku-4-5-20251001`) |

---

## DOCUMENTATION RULE

**Always apply this rule when creating or updating any documentation in this project:**

1. **Check first.** Does a relevant doc file already exist in `docs/`? If yes, **update it** — do not create a duplicate file.
2. **If no file exists,** create it in `docs/`.
3. **Always sync the cache.** After any change to a `.md` doc file, update the matching entry in `data/docs-content.js`. If the doc is new, add a new entry at the appropriate position.
4. **Register new docs in `project-data.js`.** Add the new doc to the `docs` array so it appears in the in-app Docs tab.

This rule prevents stale content in the Docs viewer and duplicate/orphaned files from accumulating over time.

---

## LINK RULE — ALWAYS USE THE DOCS FRONTEND

**Any link in a `.md` file that points to another doc or skill must use `docs.html?doc=PATH` format.**

```
[Link Text](docs.html?doc=docs/SETUP_GUIDE.md)   ← correct
[Link Text](docs/SETUP_GUIDE.md)                  ← WRONG — opens raw file
[Link Text](SETUP_GUIDE.md)                       ← WRONG — broken
```

- The `PATH` must exactly match the `path` value in `data/project-data.js`
- This applies in `docs/*.md` and `README.md`
- `CLAUDE.md` and skill files are exempt — they are read in a terminal, not a browser
- Full reference: `docs/LINK_MANAGEMENT.md`

---

## FUTURE: BLOCKNOTE MIGRATION

The notes editor currently uses a styled `contenteditable` div. It is designed to be replaced with **BlockNote** (React-based block editor) in a future migration when this project gets a proper build setup. The editor interface uses `getContent()`/`setContent()`/`onChange()` patterns to keep the swap clean.
