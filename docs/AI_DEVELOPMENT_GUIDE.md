# AI Development Guide

How to develop the Local Business Manager efficiently using Claude Code. This guide covers token conservation, the right model for each task type, and the conventions that keep AI-assisted work clean and consistent.

---

## Recommended Model

| Task | Model | Model ID |
|---|---|---|
| New feature, refactoring JS | Sonnet 4.6 | `claude-sonnet-4-6` |
| Architecture decisions, big rewrites | Opus 4.6 | `claude-opus-4-6` |
| CSS tweaks, small edits, doc updates | Haiku 4.5 | `claude-haiku-4-5-20251001` |

Switch with `/model <model-id>` in Claude Code.

**Default to Sonnet.** Only escalate to Opus when the task genuinely requires multi-file reasoning or architectural judgment. Haiku is fast and cheap for anything that is purely mechanical.

---

## Session Start Protocol

Every new Claude Code session in this folder should begin by reading:

1. `CLAUDE.md` — session bootstrap, file map, design rules
2. `SKILL.md` — how to add features, update styles, extend the app
3. `DESIGN_SKILL.md` — design reference before any CSS or UI work

Claude Code loads `CLAUDE.md` automatically. Mention the other files explicitly when the task involves UI or feature work.

---

## Token Conservation Rules

### 1. Give Claude a specific task, not a vague request

**Wasteful:**
> "Check the whole codebase and improve things."

**Efficient:**
> "In `task-app.js`, the `normalizeTask()` function needs a new `dueDate` field with a default of `null`. Add it and update the modal in `index.html` to include a date input."

Specificity eliminates exploration rounds. Each exploration round costs tokens before any real work begins.

### 2. Read SKILL files before starting feature work

Before asking Claude to add a feature, make sure it has read the relevant skill file. This prevents Claude from inventing its own approach and then needing corrections.

- Adding a keyboard shortcut → point Claude to `SKILL_ADD_SHORTCUT.md`
- CSS or UI work → point Claude to `DESIGN_SKILL.md`
- General feature → point Claude to `SKILL.md`

### 3. Keep docs-content.js in sync — always

`data/docs-content.js` is a pre-rendered cache of all markdown docs. It is **not generated automatically**. When you change any `.md` file that appears in the docs index, you must also update the matching entry in `docs-content.js`.

If you forget, the Docs tab in the browser will show stale content.

**Rule:** Any Claude session that edits a doc file must also update `data/docs-content.js` in the same commit.

### 4. Commit after each phase of work

Context windows are finite. Committing at natural boundaries gives you a clean rollback point and keeps the diff small for the next session. Claude works better on incremental changes than on large uncommitted diffs.

```bash
git add -A && git commit -m "feat(lbm): <what changed>"
```

### 5. Use PHASES.md for context-window handoffs

When a task is too large for one context window, `PHASES.md` has structured prompts for each build phase. Copy the relevant phase prompt into a fresh Claude Code window. Each prompt includes: workspace, context, what to do, and how to end the phase.

---

## The 5-Location Rule for Keyboard Shortcuts

Every new keyboard shortcut touches exactly **5 locations**. Missing any one creates an inconsistency that will confuse users and future AI sessions.

| # | File | What to update |
|---|---|---|
| 1 | `task-app.js` | Key handler logic |
| 2 | `styles.css` | New UI styles (if needed) |
| 3 | `index.html` | Row in `#shortcutsPanel` |
| 4 | `docs/KEYBOARD_SHORTCUTS.md` | Table row |
| 5 | `data/docs-content.js` | Mirror the table row (cache sync) |

See `SKILL_ADD_SHORTCUT.md` for the full step-by-step process with code templates.

---

## How to Add a New Doc

1. Create the markdown file in `docs/`
2. Add an entry to the `docs` array in `data/project-data.js`:
   ```js
   {
     title: "Your Doc Title",
     summary: "One-line description for the docs index.",
     path: "docs/YOUR_DOC.md"
   }
   ```
3. Add the cached content to `data/docs-content.js`:
   ```js
   "docs/YOUR_DOC.md": [
     "# Your Doc Title",
     "",
     "Content line by line...",
     ""
   ].join("\n"),
   ```
4. The Docs tab in the browser will now show the new document automatically.

---

## How to Add a New Skill

Skills are developer reference files (not user docs). They appear in the **Skills** section of the Docs tab.

1. Create the skill file in the root of the project (e.g., `SKILL_SOMETHING.md`)
2. Add an entry to the `skills` array in `data/project-data.js`:
   ```js
   {
     title: "Skill Title",
     summary: "What this skill covers.",
     path: "SKILL_SOMETHING.md"
   }
   ```
3. Add the cached content to `data/docs-content.js` under the same path key.
4. Reference the skill from `CLAUDE.md` so future sessions know when to read it.

---

## Giving Feedback to Improve AI Behaviour

When Claude makes a mistake or misses a convention, update the relevant skill file so future sessions don't repeat it.

- Wrong CSS pattern → add a note to `DESIGN_SKILL.md` under the relevant section
- Wrong shortcut implementation → add a note to `SKILL_ADD_SHORTCUT.md`
- General LBM development mistake → add a note to `SKILL.md`

This turns one-off corrections into permanent guidance. The skill files are the institutional memory of this project.

---

## AI-Recommended Task Convention

When an AI session recommends a new task, add it to `data/project-data.js` with these fields:

```js
{
  id: "LBM-XXX",
  title: "What the task is",
  notes: "Why it was recommended and what it involves.",
  lane: "backlog",
  priority: "P2",
  area: "product",
  source: "recommended",
  recommendedBy: "Claude Sonnet 4.6",
  references: []
}
```

This keeps human-requested work distinct from AI-suggested work and makes the source traceable.

---

## Common Gotchas

| Gotcha | What to do |
|---|---|
| `docs-content.js` shows old content in browser | Update the matching key in `data/docs-content.js` to match the current `.md` file |
| Task fields missing after seed reset | Add missing fields to `normalizeTask()` in `task-app.js` with safe defaults |
| Board column not showing in list view | The lane key must be in `ACTIVE_LANES` in `task-app.js` |
| Shortcut fires inside text inputs | Add the input guard at the top of the key handler (see `SKILL_ADD_SHORTCUT.md`) |
| Style looks wrong after edit | Check `DESIGN_SKILL.md` Section 3 (Color System) and Section 4 (Spacing) for the correct tokens |
