# SKILL: Add a Task to LBM via Claude

Read this file fully before executing. This skill runs whenever the user wants to log a task to the Local Business Manager (LBM) during any Claude Code session.

---

## CORE PHILOSOPHY — Every Task Has a Revenue Story

LBM is built toward a specific goal: **$1 → $10 → $100 → $1,000,000** in revenue from this project. Every task you add should serve that path. Before creating a task, ask: does this move the needle toward profit? If yes, at what stage?

A task without a value story is a distraction. The description format below enforces this — every task must answer **what**, **why it matters**, **why it's valuable**, and **why it's urgent**.

---

## PREFERRED METHOD: FILE-BASED (no browser required)

Use this method when Claude Code is open in the LBM workspace.

### Steps

1. **Read `data/tasks.json`** to find the next unused ID.
2. **Parse** the request using the inference tables below.
3. **Build the description** using the 4-section format (see below).
4. **Show the draft** task to the user.
5. **Write the task** to `data/tasks.json` — append to the `"tasks"` array. Assign the next sequential ID (`LBM-XXX`).
6. **Run the sync script**:
   ```
   node scripts/sync-tasks.js
   ```
7. **Tell the user**: "Task added. Reload the browser tab to see it."

### Rules for tasks.json writes
- Always read `data/tasks.json` first to see existing IDs before assigning a new one.
- Default `lane` is `"newly-added-or-updated"` unless the user specifies otherwise.
- Do NOT set `priority` — it is derived by `normalizeTask()` from `urgency`.
- Do NOT set `lastModified` — auto-set by the app on first load.
- `source` is `"user-requested"` for user tasks; `"recommended"` + `recommendedBy` when Claude is suggesting.

---

## FALLBACK METHOD: BROWSER CONSOLE

Use this when not in the LBM workspace (e.g. cross-project usage). Generate a `window.LBM.addTask({...})` command and tell the user to paste it in the LBM tab's DevTools console.

---

## TRIGGER PHRASES

Any of the following starts a full run:

- "Add this to the task board"
- "Add to LBM: [description]"
- "Create a task for X"
- "Log this as a task"
- "Track this in LBM"
- "Make a task: X" / "LBM task: X"
- "Put this on the board"

---

## EXECUTION STEPS

### Step 1 — Parse the request

Extract from what the user said or the current context:

| Field | Notes |
|---|---|
| `title` | Required. Clear action-oriented phrase. |
| `urgency` | 1–5 (infer from language cues — see table below) |
| `effort` | 1–10 (infer from task complexity — see table below) |
| `value` | Dollar amount (infer from context — see table below) |
| `area` | Primary category key (infer from subject matter — see table below) |
| `tags` | One or more tag keys (infer from subject — see tag table below) |
| `description` | Structured 4-section text (build using the format below) |
| `notes` | Short one-liner summary (plain text, max ~150 chars) |
| `addedBy` | **Always set to the Claude model ID** when Claude creates the task (e.g. `"claude-sonnet-4-6"`) |

### Step 2 — Infer urgency

| Language cue | Urgency |
|---|---|
| "critical", "blocker", "blocking", "ASAP", "emergency" | 5 |
| "important", "high priority", "soon", "immediately" | 4 |
| No cue / "medium", "normal" | 3 (default) |
| "when I get to it", "someday", "low priority", "eventually" | 2 |
| "nice to have", "optional", "minor", "low" | 1 |

### Step 2b — Infer effort (1–10)

Effort measures how much work the task requires — independent of urgency or value.

| Task complexity | Effort |
|---|---|
| Tiny change — rename, one-liner fix, copy edit | 1 |
| Small, well-scoped — single function, simple style tweak | 2–3 |
| Medium — a few files, new component, moderate logic | 4–5 (default) |
| Large — multi-file feature, new page, significant refactor | 6–7 |
| Very large — new system, major architecture change | 8–9 |
| Epic — requires multiple sessions, many moving parts | 10 |

**Rules:**
- Default to `5` when there is no complexity signal.
- If the user says "quick", "easy", "small", "one-liner" → lean toward 1–3.
- If the user says "big", "complex", "whole system", "rethink" → lean toward 7–10.
- Effort is independent of urgency. A critical one-liner fix is urgency 5, effort 1.

### Step 3 — Infer value ($)

Tie the value to the revenue path ($1 → $10 → $100 → $1M):

| Context | Value |
|---|---|
| Directly enables revenue, payment, or conversion | $25,000 |
| Improves user experience or growth (marketing, UX, retention) | $10,000 |
| Internal efficiency, automation, tooling, docs | $5,000 |
| Minor, cosmetic, low-impact | $1,000 |

### Step 4 — Infer area

| Subject matter | Area key |
|---|---|
| Documentation, README, guides, write-ups | `"docs"` |
| Security, auth, permissions, SSL, certs | `"security"` |
| Design, UI, UX, layout, CSS, colors, fonts | `"ui-ux"` |
| Platform, infra, deploy, build, CI/CD | `"platform"` |
| Release, versioning, ship, launch, publish | `"release"` |
| Product features, user stories, workflow | `"product"` |
| Everything else | `"project-system"` |

### Step 5 — Infer tags (multi-tag)

Tags are more granular than area. Assign one or more from this list:

| Subject matter | Tag key |
|---|---|
| Growth, social, SEO, outreach, audience | `"marketing"` |
| Pricing, revenue, conversion, payments, upsell | `"monetization"` |
| UI design, layout, visual polish, animations | `"ux"` |
| Code, architecture, refactoring, APIs | `"dev"` |
| Automation, tooling, scripts, workflow efficiency | `"efficiency"` |
| Copy, onboarding messages, blog, docs content | `"content"` |
| Tracking, reporting, metrics, dashboards | `"analytics"` |
| Security, auth, compliance, data privacy | `"security"` |
| Documentation, README, how-to guides | `"docs"` |
| Release, versioning, shipping | `"release"` |
| Core product features, user stories | `"product"` |
| Infrastructure, deploy, platform | `"platform"` |

**Always include `"ai"` in the tags array for every task you create.** This is a reserved tag (cyan color) that marks tasks added by Claude — always append it regardless of other tags.

A task tagged `["monetization", "ux", "ai"]` means it's a UX change that directly affects revenue conversion, added by Claude.

### Step 6 — Build the description

Every task description must have these four sections. Be specific — this text is what an AI agent uses to execute the task. Write it as if briefing a capable developer or marketer who has no prior context.

```
## What to do
[Clear, specific prompt or instruction. Write this as if it's a brief for an AI agent — include enough context that the task could be executed without asking follow-up questions. Include partial code, links, or examples where relevant.]

## Why it matters
[Why does this task exist? What breaks, stalls, or suffers if it doesn't get done? Connect it to user experience, revenue, or mission.]

## Why it's valuable
[What does completing this unlock? Quantify if possible. How does it move the project along the $1 → $10 → $100 → $1M revenue path?]

## Why it's urgent
[What makes this time-sensitive now vs later? Is there a dependency, a window of opportunity, or a compounding cost if deferred?]
```

**Rules:**
- The `## What to do` section should read like an AI-executable prompt. If the user gave you a partial prompt, include it.
- `## Why it's valuable` should explicitly name the revenue tier it serves where possible (e.g. "This enables the first paying customer by...")
- Keep each section concise — 2–5 sentences max per section.

### Step 7 — Show draft to user

Show the full task before executing:

```
Adding to LBM:
  Title:       "Add Stripe checkout to the upgrade flow"
  Urgency:     5 (Critical)
  Effort:      7 / 10
  Value:       $25,000
  Area:        product
  Tags:        monetization, dev
  Added by:    claude-sonnet-4-6
  Notes:       "No payments possible without this — first revenue gate"

  Description preview:
  ## What to do
  Integrate Stripe Checkout into the upgrade button flow...

  ## Why it matters
  Without payments, the product cannot generate revenue...

  ## Why it's valuable
  This is the $1 gate — everything on the monetization path depends on this...

  ## Why it's urgent
  No other monetization work unblocks until this is in place...
```

Then show the console command (Step 8) if using the browser fallback.

### Step 8 — Generate the console command (browser fallback only)

```javascript
window.LBM.addTask({
  title:       "Add Stripe checkout to the upgrade flow",
  urgency:     5,
  effort:      7,
  value:       25000,
  area:        "product",
  tags:        ["monetization", "dev"],
  source:      "user-requested",
  addedBy:     "claude-sonnet-4-6",
  notes:       "No payments possible without this — first revenue gate",
  description: "## What to do\nIntegrate Stripe Checkout...\n\n## Why it matters\n...\n\n## Why it's valuable\n...\n\n## Why it's urgent\n..."
})
```

**Rules:**
- Do NOT pass `id` — auto-generated
- Do NOT pass `priority` — derived from `urgency` by `normalizeTask()`
- Do NOT pass `lastModified` — auto-set to today
- Do NOT pass `lane` unless overriding the default (`"newly-added-or-updated"`)
- `source` is almost always `"user-requested"`; use `"recommended"` + `recommendedBy` when Claude is suggesting it

---

## CROSS-PROJECT USAGE

When Claude is helping build a different project and the user wants to log a task to LBM:

1. LBM should be open in a second browser tab
2. Generate the `window.LBM.addTask({...})` command
3. Tell the user to paste it in the LBM tab's DevTools console (F12 → Console)

See `CLAUDE_INTEGRATION_GUIDE.md` for full cross-project workflow.

---

## WHAT window.LBM EXPOSES

```javascript
// Add a task (returns the normalised task object)
window.LBM.addTask({
  title:       "...",
  urgency:     3,
  effort:      5,
  value:       5000,
  area:        "product",
  tags:        ["dev", "ux"],
  addedBy:     "claude-sonnet-4-6",
  notes:       "Short one-liner summary",
  description: "## What to do\n...\n\n## Why it matters\n...\n\n## Why it's valuable\n...\n\n## Why it's urgent\n..."
})

// Inspect current tasks
window.LBM.getTasks()
```

Both methods are available in the browser console whenever `index.html` is open.

---

## VALID FIELD VALUES

```
lane:        "newly-added-or-updated" | "backlog" | "processing" | "on-hold" | "in-progress"
urgency:     1 | 2 | 3 | 4 | 5
effort:      1–10 (integer; 1 = trivial, 10 = epic — default 5)
area:        "project-system" | "docs" | "product" | "platform" | "release" | "security" | "ui-ux"
tags:        array including "ai" (always) + any of: "marketing" | "monetization" | "ux" | "dev" | "efficiency" | "content" | "analytics" | "security" | "docs" | "release" | "product" | "platform"
source:      "user-requested" | "recommended" | "local-note"
addedBy:     Claude model ID string — ALWAYS set this when Claude creates the task
             e.g. "claude-sonnet-4-6" | "claude-opus-4-6" | "claude-haiku-4-5-20251001"
             Leave blank ("") for tasks created by the user manually.
description: string (4-section markdown format — see Step 6)
notes:       string (short plain-text one-liner, max ~150 chars)
```

---

## WORKED EXAMPLE — Revenue-critical task

**User says:** "We need to add a pricing page, this is critical for getting our first paying customer"

**Claude builds:**

```
Title:    "Build a pricing page with plan comparison"
Urgency:  5 (Critical)
Effort:   6 / 10
Value:    $25,000
Area:     product
Tags:     monetization, ux, dev
Added by: claude-sonnet-4-6
Notes:    "First conversion point — no pricing page means no paying customers"

Description:
## What to do
Create a /pricing.html page (or pricing section in index.html) showing 3 tiers:
Free (local-only), Pro ($9/mo — cloud sync + export), Business ($29/mo — team + priority support).
Each tier card should list 4–5 bullet features, a CTA button ("Get Started" / "Upgrade"), and a FAQ accordion below.
Match the existing design system (see DESIGN_SKILL.md). Wire the Pro/Business CTAs to the Stripe checkout flow once it exists.

## Why it matters
Users landing on LBM have no way to understand what paid tiers exist or why they should upgrade.
Without a pricing page, the funnel has no conversion point and the product cannot generate revenue.

## Why it's valuable
This is the $1 gate. A single conversion from this page proves the monetization model works and unlocks iteration toward $10, $100, and beyond. Every week without this page is a week of zero revenue.

## Why it's urgent
The product is functionally ready. The only thing between the current state and the first dollar is a conversion path. Pricing page + checkout = the minimal viable monetization loop. Build this before any other feature work.
```

---

## WORKED EXAMPLE — Efficiency task

**User says:** "Add a script to auto-export tasks as CSV so I can share them"

**Claude builds:**

```
Title:    "Add CSV export for the task list"
Urgency:  3 (Medium)
Effort:   3 / 10
Value:    $5,000
Area:     product
Tags:     efficiency, dev
Added by: claude-sonnet-4-6
Notes:    "Enables sharing task snapshots with non-technical stakeholders"

Description:
## What to do
Add an "Export CSV" button to the List View toolbar (next to the filter/sort controls).
On click, generate a CSV string from window.LBM.getTasks() including columns:
ID, Title, Area, Tags, Urgency, Value, Lane, Notes, Last Modified.
Trigger a browser download via a dynamically created <a download> link. No server needed.
See task-app.js for the existing toolbar pattern and how addTask works.

## Why it matters
There is currently no way to extract task data in a shareable format.
This blocks workflows where a collaborator or stakeholder needs a task snapshot outside the browser.

## Why it's valuable
Enables the first external stakeholder workflow — moving LBM from solo tool to team-sharable.
This is a $10-tier unlock: it adds enough utility to justify recommending LBM to a second person.

## Why it's urgent
Low urgency in isolation, but unblocks a future collaboration feature.
Defer until after monetization-critical tasks are done.
```
