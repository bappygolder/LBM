# Private Documentation — LBM

> **This folder is gitignored from the public `lbm-free` repo.**
> It is tracked and committed **only** in `lbm-pro` (the private paid repository).
> Anyone who downloads or clones the public repo gets nothing from here.

---

## What Lives Here

This folder contains internal strategy, product plans, and competitive intelligence that should not be published in the open-source version:

| File | Contents |
|---|---|
| `README.md` | This file — private docs system guide |
| `INTERNAL_ROADMAP.md` | Product strategy, monetisation plan, repo structure, privatization plan |
| `SHORTCUT_MANAGEMENT_PLAN.md` | Full specification for the Shortcut Management System (major USP) |

---

## Why This Folder Exists

The `private/` pattern lets us:

1. **Work openly on the public codebase** — anyone can clone lbm-free and see the app code, docs, and public roadmap
2. **Keep strategy private** — monetisation plans, competitive positioning, and unreleased feature specs stay out of the public repo
3. **Still version-control everything** — private docs are committed to lbm-pro, so they have full git history, blame, and diff support

---

## Versioning Private Docs

Private docs are versioned in two ways:

### 1. Git History (lbm-pro)

Every commit to lbm-pro that touches `private/` is the authoritative version history. Use standard git practices:

```bash
# See history of this folder
git log --oneline private/

# See what changed in a specific file
git log --oneline -- private/SHORTCUT_MANAGEMENT_PLAN.md

# See a specific version of a file
git show <commit-hash>:private/SHORTCUT_MANAGEMENT_PLAN.md
```

### 2. In-File Version Log

Each document in `private/` should maintain a `## Version Log` section at the bottom with dated, plain-English entries. This makes it easy to skim the history of a decision without reading git diffs.

**Format:**
```
## Version Log

2026-04-02 — v0.1 — Initial draft.
2026-05-15 — v0.2 — Phase 2 plan added. Backend stack confirmed as Supabase.
2026-06-01 — v1.0 — Decision made: ship as free feature. USP marketing copy drafted.
```

Keep entries brief — one to three lines per version. The git diff has the detail; the log is the summary.

---

## How Private Docs Sync Between Repos

The flow is **one-way: lbm-free → lbm-pro**.

```
lbm-free (public)          lbm-pro (private)
─────────────────          ─────────────────
index.html         ──→     index.html  (periodically merged)
task-app.js        ──→     task-app.js
styles.css         ──→     styles.css
...                ──→     ...
                           private/    (only in lbm-pro)
                           auth/       (only in lbm-pro)
                           api/        (only in lbm-pro)
```

**To pull public improvements into lbm-pro:**
```bash
# In lbm-pro repo:
git remote add upstream git@github.com:yourname/lbm-free.git
git fetch upstream
git merge upstream/main --no-commit   # review before finishing
```

**Never merge private/pro code back into lbm-free.** The flow is one-directional.

---

## Adding a New Private Document

1. Create the file in `private/` with a frontmatter header:
   ```markdown
   ---
   title: Document Title
   status: Planning / Active / Archived
   version: 0.1
   updated: YYYY-MM-DD
   visibility: private (lbm-pro only)
   ---
   ```
2. Add a row to the table in this `README.md`
3. Add an in-file `## Version Log` section
4. Commit to lbm-pro

**Do NOT add private docs to `data/project-data.js` or `data/docs-content.js`** — those files are part of the public repo. Private docs are only viewable by opening the `.md` files directly in a text editor or IDE.

---

## What Should NOT Be Here

- Public-facing docs (put those in `docs/`)
- Code files (put those at the project root)
- Temporary notes or drafts (use a scratch file outside the repo)
- Anything that references real user data or credentials

---

## Version Log

```
2026-04-02 — v0.1 — Initial private docs system documented.
                    README, INTERNAL_ROADMAP, and SHORTCUT_MANAGEMENT_PLAN created.
```
