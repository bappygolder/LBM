# Local Business Manager (LBM)

**LBM** is a lightweight, self-contained, vanilla JavaScript task and project manager designed for developers and creators. It is a local-first alternative to Notion that requires zero installation, no backend, and no build step. Drop this folder into any Git repository and open `index.html` — it works immediately.

---

## The Vision

As AI matures, how we consume business tools is changing.

> *"With AI, we don't just buy coaches or tools separately — we buy everything in a box."*

LBM is the foundational tier of a three-part vision:

| Tier | Name | Status | Audience |
|---|---|---|---|
| 1 | **LBM** — Local Business Manager | Open Source / Free | Developers, solo creators |
| 2 | **OBM** — Online Business Manager | Freemium SaaS (planned) | Entrepreneurs, startups |
| 3 | **Business in a Box** | Premium agency rollout (planned) | Corporations, scaling teams |

Read the full [Vision and Philosophy](docs/VISION_AND_PHILOSOPHY.md) for the big picture.

---

## Quick Start

1. **Copy this folder** into your project (or clone the repo)
2. **Open `index.html`** in any modern browser (Chrome, Firefox, Safari, Edge)
3. **Start using it** — sample tasks are pre-loaded so you can see everything working

That is it. No npm, no build step, no sign-up.

> **Note:** If the Docs tab shows empty content, serve the folder locally to avoid browser CORS restrictions:
> ```bash
> cd 1_LBM_Local_Business_Manager
> python3 -m http.server 8080
> # Open http://localhost:8080
> ```

---

## Customise for Your Project

All customisation happens in `data/project-data.js`:

```js
project: {
  name: "LBM",                      // short name in the header
  fullName: "Local Business Manager",
  maintainedBy: "Your Name",
},
tracker: {
  areas: ["design", "dev", "ops"],   // filter categories
  tasks: [...]                       // your seed task backlog
}
```

Save the file and refresh to see changes.

**Full customisation guide:** [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

---

## Handing Off to Someone Else

LBM is designed to be handed to a new user with no setup friction:

1. Commit your current `data/project-data.js` with the right seed tasks and areas
2. Send them the folder (zip, git clone, or copy)
3. They open `index.html` — done

New users always start from the committed seed data. Point them at [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for a complete walkthrough.

---

## For Developers

### File Map

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
├── docs/                  ← project documentation
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

### Key Design Rules

- **Vanilla JS + HTML/CSS only** — no build step, no npm
- **Local-first** — all task state lives in `localStorage`; `data/project-data.js` is the git-tracked baseline
- **Dark theme only** — all CSS tokens optimise for dark backgrounds
- **`docs-content.js` is a cache** — always update it when you change a `.md` doc file

### Adding Features

See [SKILL.md](SKILL.md) for the development guide.  
See [DESIGN_SKILL.md](DESIGN_SKILL.md) before any CSS or UI work.  
See [docs/AI_DEVELOPMENT_GUIDE.md](docs/AI_DEVELOPMENT_GUIDE.md) for working with Claude Code efficiently.

---

## Documentation

All guides live in the [docs/](docs/) folder and are readable inside the app via the **Docs tab**.

| Guide | What it covers |
|---|---|
| [Setup Guide](docs/SETUP_GUIDE.md) | First-time setup and customisation |
| [AI Development Guide](docs/AI_DEVELOPMENT_GUIDE.md) | Claude Code workflow, token savings, model recommendations |
| [Keyboard Shortcuts](docs/KEYBOARD_SHORTCUTS.md) | All power-user shortcuts |
| [Persistence and State](docs/PERSISTENCE_AND_STATE.md) | Where data lives and how sync works |
| [Local Project System](docs/LOCAL_PROJECT_SYSTEM.md) | Tracker + docs workflow |
| [Vision and Philosophy](docs/VISION_AND_PHILOSOPHY.md) | Three-tier product roadmap |
