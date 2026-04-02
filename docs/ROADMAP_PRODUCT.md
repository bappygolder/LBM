# Product Roadmap

LBM is being developed as a three-tier ecosystem — each tier building on the last without replacing it.

---

## Product Tiers

| Tier | Name | Status | Description |
|---|---|---|---|
| 1 | **LBM Free** | Active (v1) | Local-first, browser-based, open source, zero account required |
| 2 | **LBM Pro / OBM** | Planned | Cloud-synced, multi-device, team features |
| 3 | **Business in a Box** | Long-term | Full agency rollout — structured templates, proprietary content |

The current project is Tier 1. Everything being built now is the foundation that Tier 2 and 3 will extend — not replace.

---

## Technology Principles

These are non-negotiable. Every feature decision should be measured against them.

**Vanilla JS + HTML/CSS only** — no build step, no npm, no framework. Open `index.html` and it works. This keeps LBM installable in 10 seconds and maintainable by anyone who can read a `<script>` tag.

**Local-first by default** — all state lives in `localStorage`. The app works offline, always. Cloud sync (Tier 2) will be an enhancement, not a dependency.

**Speed as a feature** — every interaction should feel instant. No loading spinners, no server round-trips, no optimistic UI. If something feels slow, it gets fixed.

**Drop-in portability** — LBM should be embeddable inside any project folder. Change the storage key and it becomes a completely separate tracker. This is a unique use case that most tools ignore.

---

## Free Version (Tier 1) — Active Development

### What exists now

- List View with sorting, filtering, search, multi-select, drag-and-drop reorder
- Board View (Kanban) with drag-and-drop between columns, column collapse
- Task Detail Panel with rich-text notes editor
- Undo system (delete, lane change, title edit)
- Voice input for task creation (Web Speech API)
- Keyboard shortcuts throughout
- Docs Hub (this viewer)
- Resources tab
- Custom storage key (isolates data per copy)

### What's planned

**Shortcut Management System** — full keyboard shortcut customisation with OS conflict detection. See the [full specification](docs.html?doc=docs/ROADMAP_SHORTCUTS.md). This is our most ambitious planned feature and one of our core differentiators.

**Due date field** — lightweight deadline support without overcomplicating the task model. A single date field, a filter, and a visual indicator for overdue tasks.

**Redo (Cmd+Shift+Z)** — follow-on to the undo system. Redo stack that mirrors the undo stack.

**Undo across page refresh** — serialise the undo stack to `sessionStorage` so an accidental refresh doesn't wipe history.

**Contributing guide** — a `CONTRIBUTING.md` for open-source collaborators covering how to run the app, add features, add shortcuts, and submit PRs.

---

## Pro Version (Tier 2) — Planned

The Pro version extends LBM Free without forking it. The same UI, the same data model, the same feel — but with a cloud persistence layer replacing `localStorage` calls.

### What changes

```javascript
// Free version
localStorage.setItem('lbm-tasks', JSON.stringify(tasks));

// Pro version (same shape, different persistence)
await api.tasks.save(tasks);
```

Only two fields added to the task model: `user_id` and `workspace_id`.

### Planned Pro features

- Cloud sync (tasks, settings, shortcut profiles)
- Multi-device access (same account, any browser)
- Shared workspaces (teams)
- Activity log
- Version history per task

### Technology path

**Stage 1 — Supabase:** Managed Postgres + Auth + REST API. Free tier handles the early user base with zero server management.

**Stage 2 — PocketBase on VPS:** Single Go binary, SQLite, built-in auth and admin UI. Better unit economics when scale justifies it. Full data ownership.

---

## Defensibility

What makes LBM hard to copy, beyond the feature list:

**Zero friction entry** — no account, no setup, no install. Open a file. This is a promise that must never be broken, even in the Pro version.

**Local-first trust** — no privacy concern, works offline, data always accessible. This earns trust with users who've been burned by cloud-only tools going down or changing pricing.

**Built for the right audience** — not software teams. Local business owners, freelancers, solopreneurs, creators. The language and UX fits how they think, not how engineers think.

**Keyboard-first power** — serious shortcuts, customisable bindings, conflict awareness. Power users become advocates.

---

## Open Questions

These are unresolved. Decisions will be logged as they're made.

- Who exactly is the paying Tier 2 user? (solopreneur / small team / agency)
- Tier 1 licence: MIT (maximum distribution) or AGPL (prevents SaaS-on-our-code without contributing back)?
- Tier 2 pricing: subscription ($7–9/month solo) or one-time purchase ($49)?
- Agency tier: multi-tenancy required? (significant complexity — likely deferred)
- Branding: keep "LBM" for both tiers, or rename Pro to "OBM"?

---

## Decisions Log

```
2026-04-02 — Free vs paid split decided: local-only free, cloud-synced paid.
             Repo strategy: lbm-free (public, MIT) + lbm-pro (private, proprietary).
             Backend path: Supabase first, PocketBase at scale.
             Shortcut Management System added as planned USP for Tier 1 (free feature).
```
