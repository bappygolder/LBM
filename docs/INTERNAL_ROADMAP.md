# LBM Product Roadmap — Strategy & Vision

> **Status: Publicly tracked in version control.**
> This document is intentionally open — contributors and future collaborators are welcome to read and build on this roadmap.
> When the project matures and certain sections need to be restricted, those parts will move to a private repo.

---

## Purpose

This is the internal strategy reference for the evolution of LBM from a free, local-first tool into a sustainable, monetized product. It is a living document — update it as decisions are made and strategies evolve.

**Last updated:** 2026-04-02

---

## 1. Product Vision

LBM is being developed as a three-tier ecosystem:

| Tier | Name | Status | Description |
|---|---|---|---|
| 1 | **LBM Free** | Active (v1) | Local-first, browser-based, open source, zero account |
| 2 | **LBM Pro / OBM** | Future | Cloud-synced, multi-device, team features, subscription |
| 3 | **Business in a Box** | Long-term | Full agency rollout — proprietary content + white-label |

The current project is Tier 1. This document covers the path to Tier 2 and beyond.

---

## 2. GitHub & Repository Strategy

### Structure

```
GitHub (public)      lbm-free/    ← open source, MIT license, community edition
GitHub (private)     lbm-pro/     ← paid version, extends lbm-free core
```

**We do NOT use a true Git fork.** True forks diverge and become a merge conflict nightmare.

### Sync Workflow (Free → Pro)

Core improvements flow one-way: **lbm-free → lbm-pro**. Never the reverse.

```bash
# In lbm-pro, to pull in improvements from the free version:
git remote add upstream git@github.com:yourname/lbm-free.git
git fetch upstream
git merge upstream/main --no-commit   # always review before finalising
```

### What Lives Where

**lbm-free (public):**
- All current UI, task logic, styles, docs
- Sample tasks and documentation
- No auth, no backend, no account system
- MIT licensed

**lbm-pro (private):**
- Everything from lbm-free (periodically synced)
- Auth layer (login, signup, session management)
- API integration (replaces localStorage with API calls)
- Team/workspace features
- Pro-only UI (activity log, version history, integrations)
- Stripe billing
- Any truly sensitive internal docs (moved to private/ when needed)

---

## 3. Backend Plan

### Migration Path

LBM's localStorage read/write calls will be replaced by API calls — the data model is unchanged.

```javascript
// Current (free)
localStorage.setItem('lbm-tasks', JSON.stringify(tasks));

// Future (pro)
await api.tasks.save(tasks);    // same shape, different persistence layer
```

### Recommended Backend Stack

**Stage 1 — Launch (use Supabase):**
- Managed Postgres + Auth + REST API + Realtime
- Free tier covers ~100–500 users
- Zero server management
- Cost: $0 free → $25/month pro tier
- Use their vanilla JS client (~40KB)

**Stage 2 — Scale (migrate to PocketBase on VPS):**
- Single Go binary, SQLite, built-in Auth + Admin UI + REST API
- Host on Hetzner VPS (~$5/month fixed cost)
- Better unit economics; full data ownership
- Migrate by exporting from Supabase → importing to PocketBase

### Database Schema (for when we build it)

```sql
CREATE TABLE tasks (
  id           TEXT PRIMARY KEY,
  user_id      UUID REFERENCES auth.users,
  workspace_id UUID,
  title        TEXT NOT NULL,
  lane         TEXT DEFAULT 'newly-added-or-updated',
  urgency      INTEGER,
  value        INTEGER,
  area         TEXT,
  source       TEXT,
  notes        TEXT,
  body         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  modified_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Only two columns added vs. current model: `user_id` and `workspace_id`.

---

## 4. Technology Stack — Pro Version

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Vanilla JS (keep current) | No overhead, instant load |
| Micro-reactivity | Alpine.js (15KB, if needed) | Auth UI without a framework |
| Styling | Current CSS (keep) | Already excellent |
| Backend | Supabase → PocketBase | See above |
| Auth | Supabase Auth / PocketBase Auth | Baked in |
| Payments | Stripe (Checkout + Billing Portal) | Industry standard |
| Frontend hosting | Cloudflare Pages | Free global CDN |
| Backend hosting | Supabase cloud → Hetzner VPS | Cheap, reliable |

**Do NOT add:** React, Vue, GraphQL, Docker (for local dev), Webpack/Rollup

**Only add a build step if:** BlockNote migration happens (then use Vite, pro version only)

---

## 5. Monetization Plan

### Pricing Tiers

| Tier | Price | Features |
|---|---|---|
| **Free** | $0 forever | Local-only, full features, no account, open source |
| **Solo Pro** | $7–9/month | Cloud sync, multi-device, 1 user |
| **Team** | $19–29/month | Shared workspace, 3–5 users, activity log |
| **Agency** | $79–99/month | Unlimited users, white-label, priority support |

**Alternative model:** One-time purchase ($49) — appeals to local business owners who dislike subscriptions. "Pay once, own it."

### Launch Sequence

**Phase 1 — Validate (now → 6 months):**
- Ship free version on GitHub publicly
- Add a waitlist CTA: "LBM Cloud — coming soon"
- Do NOT build cloud features until 50+ waitlist signups confirm demand

**Phase 2 — Launch Cloud (6–12 months):**
- Ship Supabase-backed version with auth + sync
- Launch Solo Pro only at $7–9/month
- Keep it simple — no team tier yet

**Phase 3 — Expand (12–24 months):**
- Add team workspaces
- Agency/white-label tier
- Consider one-time purchase option for self-hosters

---

## 6. Open Source License

- **Free version:** MIT (maximum distribution, community trust)
- **Pro version:** Proprietary (source not published)

Consider **AGPL** for the free version if we want to prevent competitors from building a SaaS on our code without contributing back.

---

## 7. Planned USPs — Shortcut Management System

This is our single biggest planned differentiator in the keyboard-power-user market.

**The feature:** Every action in LBM has a keyboard shortcut. Every shortcut is user-editable. Every change is conflict-checked against the OS and browser before it saves.

**Why it matters:** No other local-first task tool does this. Power users — developers, designers, writers — who live on the keyboard are the most loyal and most vocal user segment. Winning them means winning word-of-mouth.

### Summary of the system

| Layer | What it does |
|---|---|
| Shortcut Registry | Central store for all shortcuts — defaults + user overrides in localStorage |
| Settings UI | Full panel to view, edit, and reset any shortcut |
| Recorder | Click to record a key combo, live capture |
| Conflict Detection L1 | Warns on internal LBM conflicts |
| Conflict Detection L2 | Blocks browser-reserved shortcuts (~40 entries) |
| Conflict Detection L3 | Warns on OS-reserved shortcuts (~90 entries, per-OS detection) |
| Dynamic UI | Tooltips and panels update live when shortcuts change |
| Import/Export | Share shortcut profiles as JSON (Pro: cloud sync) |

### Strategic position

- **Free feature** — this is the hook, not the paywall
- **Pro extension** — cloud shortcut profile sync across devices is a Pro-only feature
- **Marketing angle** — "We compiled 130+ system shortcuts so you never hit a dead key."

---

## 8. What Makes This Defensible

vs. Trello, Notion, Linear, Monday.com:
- **Zero account, zero setup** — works in 30 seconds, no friction
- **Local-first by default** — no privacy concern, works offline
- **Built for local businesses** — not software teams; language and UX fits our audience
- **Drop-in for any project** — embed in your dev project; unique use case

The paid version should amplify these, not abandon them. Cloud sync without sacrificing the local-first feel.

---

## 9. Open Decisions (to resolve before building)

- [ ] Who exactly is the paying user? (solopreneur / small biz owner / agency)
- [ ] Managed backend (Supabase) or self-hosted (PocketBase on VPS)?
- [ ] Free version: MIT or AGPL?
- [ ] Pricing: subscription or one-time purchase?
- [ ] Allow users to self-host the paid version?
- [ ] Agency tier: multi-tenancy required? (significant complexity — defer)
- [ ] Branding: keep "LBM" for both, or new name for pro?

---

## 10. Privatization Plan — Private Fork Workflow (Future)

> **Status: Not started — planned for after lbm-free reaches a stable public release.**

This section documents the intended GitHub workflow for keeping sensitive development private while still publishing selectively to the public repo.

---

### The Problem

As LBM grows, there will be two types of work:

1. **Public work** — UI improvements, bug fixes, new free features — these should go into `lbm-free` and be visible to everyone.
2. **Private work** — Pro features, monetisation logic, internal tooling, strategy docs — these must never appear in the public repo.

Right now, both types of work happen in the same local folder. That works fine while it's just one person. It breaks down when collaborators or contractors are involved, or when the private repo needs a proper CI/CD pipeline.

---

### The Solution: Private Fork with Auto-Accepted PRs

#### Structure

```
GitHub (public)   lbm-free/        ← open source, community edition
GitHub (private)  lbm-private/     ← all development happens here first
```

`lbm-private` is a **private GitHub fork** of `lbm-free`. It is the source of all active development. The public repo is downstream — it only receives what we deliberately push to it.

#### Workflow

```
lbm-private  ──(PR)──→  lbm-free (public)
                              ↑
                     auto-accepted by CI
```

1. **All work starts in `lbm-private`.** Every commit, feature branch, and bug fix goes here first.
2. **When a change is ready to publish,** open a PR from `lbm-private/main` → `lbm-free/main`.
3. **The PR is auto-accepted** — a GitHub Actions workflow automatically merges PRs that come from the private fork's main branch, provided all checks pass.
4. **Private content is never included in PRs.** The `private/` folder is listed in `lbm-free`'s `.gitignore`, so git will never stage or propose those files in a cross-repo PR.

#### Auto-Accept CI Workflow (sketch)

```yaml
# .github/workflows/auto-merge-from-private.yml  (in lbm-free)
name: Auto-merge from private fork
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auto-merge:
    if: github.head_repository.full_name == 'yourname/lbm-private'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Auto-merge
        run: gh pr merge --auto --squash "${{ github.event.pull_request.number }}"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This only auto-merges PRs that originate from `lbm-private`. External PRs still require manual review.

---

### What Stays Private (when this system is active)

| Content | Location | Reason |
|---|---|---|
| Monetisation strategy | `private/` folder | Competitive exposure |
| Feature specs (unreleased) | `private/` folder | Prevents copying before launch |
| Auth / API code | `lbm-private/auth/`, `lbm-private/api/` | Pro-only features |
| Stripe integration | `lbm-private/billing/` | Subscription logic |
| Internal notes / decisions | `private/` (all files) | Strategy visibility |

---

### Steps to Implement (when ready)

- [ ] Create `lbm-private` as a private GitHub repo (fork or duplicate of `lbm-free`)
- [ ] Add `lbm-free` as a remote named `public` in `lbm-private`
- [ ] Set up the auto-merge GitHub Actions workflow in `lbm-free`
- [ ] Enable branch protection on `lbm-free/main` (require passing CI before merge)
- [ ] Update `.gitignore` in `lbm-free` to exclude all known private paths
- [ ] Document the PR checklist: what to include and what to strip before opening a public PR
- [ ] Test the full flow: private commit → PR opened → CI passes → auto-merge fires

---

### Why Not Just Use the Current Two-Repo Setup?

The current plan (Section 2) uses `lbm-free` and `lbm-pro` as sibling repos with a manual upstream sync. That works for the Pro/paid split.

The private fork model is different and complementary:
- **Current plan:** `lbm-free → lbm-pro` (free core is the source, pro adds features)
- **This plan:** `lbm-private → lbm-free` (all dev happens privately first, then published selectively)

In the mature state, the three repos coexist:

```
lbm-private  (private fork — all active dev)
     │
     ├──(public PRs, auto-accepted)──→  lbm-free  (public, open source)
     │                                       │
     └──(pro features, manual merge)──→  lbm-pro   (private, paid version)
```

---

## 11. Notes & Decisions Log

*Add dated notes here as decisions are made.*

```
2026-04-02 — Initial strategy documented. No code built yet.
             Free vs paid split decided: local-only free, cloud-synced paid.
             Repo strategy: two repos, not a true fork.
             Backend: Supabase first, PocketBase later.

2026-04-02 — Shortcut Management System added as planned USP.
             Decision: free feature (hook for user acquisition), Pro extension = cloud profile sync.

2026-04-02 — Document moved from private/ to docs/ — publicly tracked in version control.
             Rationale: safety (nothing lost), openness (collaborators welcome), privacy deferred until popular.
```
