# AI Task Creation

LBM supports two AI-powered ways to create tasks without filling out a form manually: **Claude Code skill** (via browser console) and **voice input** (mic button in the task modal).

---

## Method 1 — Claude Code Skill

Tell Claude (in any session):

> "Add this to the task board: [description]"

Claude reads `SKILL_ADD_TASK.md`, infers urgency/value/area from context, and generates a browser console command. You paste it into the LBM tab and the task appears instantly.

### Trigger phrases

- "Add this to the task board"
- "Add to LBM: [description]"
- "Create a task for X"
- "Log this as a task"
- "Track this in LBM"
- "Make a task: X" / "LBM task: X"
- "Put this on the board"

### How Claude infers fields

**Urgency:**

| What you say | Urgency |
|---|---|
| "critical", "blocker", "ASAP", "emergency" | 5 — Critical |
| "important", "high priority", "soon" | 4 — High |
| (no cue) | 3 — Medium |
| "when I get to it", "someday", "low priority" | 2 — Low |
| "nice to have", "optional", "minor" | 1 — Minimal |

**Dollar value:**

| Context | Value |
|---|---|
| Core feature / revenue-critical | $25,000 |
| User-facing improvement | $10,000 |
| Internal / docs / tooling | $5,000 |
| Minor / cosmetic | $1,000 |

**Area:**

| Subject | Area |
|---|---|
| Documentation, README, guides | Docs |
| Security, auth, permissions | Security |
| Design, UI/UX, CSS, layout | UI/UX |
| Platform, infra, deploy, CI/CD | Platform |
| Release, versioning, launch | Release |
| Product features, user stories | Product |
| Everything else | Project System |

---

## Method 2 — Voice Input

Click the **microphone button** next to the Title field in the New Task modal. Speak your task — the title auto-fills and urgency/area are inferred from keywords in your speech.

See [Voice Commands](docs.html?doc=docs/VOICE_COMMANDS.md) for the full guide.

---

## The window.LBM Console API

LBM exposes a public API in the browser console whenever `index.html` is open. You can use it directly or have Claude generate commands for you.

### window.LBM.addTask(taskObj)

Adds a task. All fields optional except `title`. Returns the full task object.

```javascript
window.LBM.addTask({
  title:   "Fix auth redirect loop",   // required
  urgency: 5,                          // 1–5 (default: 3)
  value:   10000,                      // dollar value
  area:    "security",                 // area key
  source:  "user-requested",           // or "recommended" / "local-note"
  notes:   "Happens after token expiry"
})
```

### window.LBM.getTasks()

Returns a snapshot of all tasks (copies, not live references).

```javascript
const tasks = window.LBM.getTasks();
console.log(tasks.length, "tasks");
```

### Field reference

| Field | Type | Default | Notes |
|---|---|---|---|
| `title` | string | — | **Required** |
| `urgency` | 1–5 | 3 | Sets priority automatically |
| `value` | number | derived from urgency | Dollar value |
| `area` | string | `"project-system"` | See area keys below |
| `source` | string | `"user-requested"` | `"recommended"` / `"local-note"` |
| `recommendedBy` | string | `""` | Who flagged it (if source = recommended) |
| `notes` | string | `""` | Short plain-text summary |
| `lane` | string | `"newly-added-or-updated"` | Override starting lane |

**Area keys:** `"project-system"` `"docs"` `"product"` `"platform"` `"release"` `"security"` `"ui-ux"`

**Do NOT pass:** `id`, `priority`, `lastModified` — these are always auto-generated.

---

## Example console commands

**Critical security fix:**
```javascript
window.LBM.addTask({
  title:   "Fix session token storage — fails compliance audit",
  urgency: 5,
  value:   25000,
  area:    "security",
  notes:   "Legal flagged this — must fix before next release"
})
```

**Feature improvement:**
```javascript
window.LBM.addTask({
  title:   "Add CSV export to the task list view",
  urgency: 3,
  value:   5000,
  area:    "product",
  source:  "recommended",
  recommendedBy: "Claude (LBM session)",
  notes:   "Useful for sharing snapshots with non-technical stakeholders"
})
```

**Minor cleanup:**
```javascript
window.LBM.addTask({
  title:   "Remove stale MCC task references from seed data",
  urgency: 2,
  value:   1000,
  area:    "project-system"
})
```

---

## Cross-Project Usage

LBM can receive tasks from any Claude Code session — you don't need to be working inside the LBM workspace.

See [Claude Integration Guide](docs.html?doc=CLAUDE_INTEGRATION_GUIDE.md) for the two-tab workflow and full instructions.
