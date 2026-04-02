# Link Management

This document defines how internal links must be written in all LBM documentation. It applies to all developers, contributors, and AI assistants (Claude, LLMs) working in this project.

---

## The Rule

All internal links that point to another doc or skill file must use the **docs frontend URL format** — not a raw file path.

**Correct format:**
```
[Link Text](docs.html?doc=PATH_TO_FILE)
```

**Examples:**

| Target file | Correct link |
|---|---|
| docs/ABOUT.md | `[About](docs.html?doc=docs/ABOUT.md)` |
| docs/SETUP_GUIDE.md | `[Setup Guide](docs.html?doc=docs/SETUP_GUIDE.md)` |
| docs/DEVELOPER_GUIDE.md | `[Developer Guide](docs.html?doc=docs/DEVELOPER_GUIDE.md)` |
| docs/AI_DEVELOPMENT_GUIDE.md | `[AI Development Guide](docs.html?doc=docs/AI_DEVELOPMENT_GUIDE.md)` |
| docs/PERSISTENCE_AND_STATE.md | `[Persistence and State](docs.html?doc=docs/PERSISTENCE_AND_STATE.md)` |
| docs/VOICE_COMMANDS.md | `[Voice Commands](docs.html?doc=docs/VOICE_COMMANDS.md)` |
| SKILL.md (root-level) | `[SKILL.md](docs.html?doc=SKILL.md)` |
| SKILL_ADD_SHORTCUT.md | `[Add a Keyboard Shortcut](docs.html?doc=SKILL_ADD_SHORTCUT.md)` |
| DESIGN_SKILL.md | `[Design Skill](docs.html?doc=DESIGN_SKILL.md)` |
| CLAUDE_INTEGRATION_GUIDE.md | `[Claude Integration Guide](docs.html?doc=CLAUDE_INTEGRATION_GUIDE.md)` |

---

## Why This Matters

When a link uses a raw path like `docs/SETUP_GUIDE.md`, the browser opens the file directly — the user sees unstyled markdown text, no navigation sidebar, no docs viewer. The experience breaks completely.

Using `docs.html?doc=PATH` routes through the docs viewer, which:
- Renders the markdown with proper styling
- Shows the sidebar navigation
- Keeps the user inside the app
- Works across all browsers when served locally

---

## How the URL Routing Works

`docs.html` reads the `?doc=` query parameter on page load. The viewer finds the doc item whose `path` matches the parameter value and opens it.

| URL | What opens |
|---|---|
| `docs.html` | First doc (About) — default |
| `docs.html?doc=docs/SETUP_GUIDE.md` | Setup Guide |
| `docs.html?doc=docs/AI_DEVELOPMENT_GUIDE.md` | AI Development Guide |
| `docs.html?doc=SKILL.md` | LBM Development Guide (Skill) |
| `docs.html?doc=DESIGN_SKILL.md` | Front-End Design Skill |

The `PATH` in `?doc=PATH` must exactly match the `path` field of the doc entry in `data/project-data.js`.

---

## Where This Rule Applies

| File type | Rule |
|---|---|
| `docs/*.md` | Always use `docs.html?doc=PATH` for cross-doc links |
| `README.md` | Same — README is opened locally in a browser |
| `CLAUDE.md` | Exempt — Claude reads this in a terminal, not a browser |
| Skill files (`SKILL.md`, `DESIGN_SKILL.md`, etc.) | Exempt — read by AI in terminal context |
| Source files (`task-app.js`, `data/*.js`, etc.) | Exempt — these are code, not docs |

---

## What NOT to Do

| Wrong | Why |
|---|---|
| `[Setup Guide](docs/SETUP_GUIDE.md)` | Opens raw markdown in browser |
| `[Persistence and State](PERSISTENCE_AND_STATE.md)` | Relative path — likely broken |
| `[SKILL.md](../SKILL.md)` | Navigates up the folder tree — broken in docs viewer |
| `[AI Dev Guide](AI_DEVELOPMENT_GUIDE.md)` | Missing folder prefix — broken |

---

## For Claude and AI Developers

**When adding or updating any link in a `.md` file that will be displayed in the docs viewer:**

1. Use `docs.html?doc=PATH` — never raw `.md` paths
2. The `PATH` must exactly match the `path` value registered in `data/project-data.js`
3. To find all registered doc paths, search for `path:` in `data/project-data.js`
4. After editing any doc, update the matching entry in `data/docs-content.js` (the cache must stay in sync)

**Quick reference — all registered paths:**

```
docs/ABOUT.md
docs/SETUP_GUIDE.md
docs/DEVELOPER_GUIDE.md
docs/AI_DEVELOPMENT_GUIDE.md
docs/VISION_AND_PHILOSOPHY.md
docs/PERSISTENCE_AND_STATE.md
docs/LOCAL_PROJECT_SYSTEM.md
docs/KEYBOARD_SHORTCUTS.md
docs/AI_TASK_CREATION.md
docs/VOICE_COMMANDS.md
docs/LINK_MANAGEMENT.md
PHASES.md
SKILL.md
SKILL_ADD_SHORTCUT.md
DESIGN_SKILL.md
SKILL_ADD_TASK.md
CLAUDE_INTEGRATION_GUIDE.md
```

---

## Adding a New Doc

When you add a new `.md` file to the project:

1. Register it in `data/project-data.js` with a `path` value
2. Add its content to `data/docs-content.js`
3. Any links to this new doc from other docs must use `docs.html?doc=YOUR_NEW_PATH`
4. Update this file's quick reference list above
