# Local Project System

## Goal

Keep project management and documentation close to the codebase so AI agents and humans can update them in the same workspace, without needing a separate tool.

---

## Components

### `index.html`

The main app. Local-first task board for backlog review, quick edits, filtering, export, and manual prioritisation. Open this directly in the browser — no server required.

### `docs.html`

The documentation viewer. Lists all docs and skill files registered in `data/project-data.js`. Click any entry to read the rendered markdown.

### `data/project-data.js`

Repo-owned seed data for:

- Project metadata (name, areas)
- The seed task backlog
- The docs index (what appears in the Docs tab)
- The skill index (what appears in the Skills section)

### `data/docs-content.js`

A pre-rendered cache of all markdown doc files. The docs viewer reads from this cache rather than fetching raw files — this avoids CORS issues when opening `docs.html` directly as a file. **Always keep this in sync with the `.md` files.**

### `docs/`

Markdown source files for project guides, architecture notes, and workflow docs. These are the source of truth — `docs-content.js` is derived from them.

---

## How to Add Tasks

### Durable, repo-owned tasks

Add them to the `tasks` array in `data/project-data.js` and commit. Everyone who opens the app fresh will see these tasks.

### Personal working notes

Add them inside the browser UI. They are stored in `localStorage` on that machine only.

---

## AI-Recommended Tasks

When an AI assistant recommends a task for the backlog, mark it with:

```js
source: "recommended",
recommendedBy: "Claude Sonnet 4.6"
```

This keeps human-requested work distinct from AI-suggested work and makes the provenance traceable in the task list.

---

## How to Add a New Doc

1. Create the `.md` file in `docs/`
2. Add an entry to the `docs` array in `data/project-data.js`
3. Add the cached content to `data/docs-content.js`

The Docs tab will pick it up automatically. See [AI Development Guide](AI_DEVELOPMENT_GUIDE.md) for the full step-by-step.

---

## Online Sync Model

The local tracker is the fast workspace — not an automatic sync engine. For cross-device or team visibility:

1. Update repo-owned tasks in `data/project-data.js` and commit
2. Or export JSON/Markdown from the app and import into an online tool

If online sync becomes important, write a small sync script against the chosen service rather than trying to make static HTML write directly to repo files.
