---
title: Shortcut Management System — Product Plan
status: Planning
version: 0.1
updated: 2026-04-02
visibility: private (lbm-pro only)
---

# Shortcut Management System

> **Confidential — internal planning document.**
> This file lives in `private/` and is excluded from the public lbm-free repo.
> It is tracked in lbm-pro (the private paid repo) only.

---

## The Big Idea

Most apps treat keyboard shortcuts as hardcoded plumbing — invisible to the user, impossible to change, and a constant source of conflict with OS shortcuts and other apps.

LBM will be different.

**Every action in LBM will have a keyboard shortcut. Every shortcut will be user-editable. Every change will be conflict-checked against the system before it saves.**

This is not just a feature. It is a USP.

No other local-first task manager has thought this deeply about keyboard UX. We will be the first to ship conflict-aware, fully customisable shortcuts as a first-class feature — and we will market it as such.

**Target tagline:** *"Every shortcut, fully yours — zero system conflicts."*

---

## Why This Matters (The Problem We're Solving)

Users who rely on keyboard shortcuts are the most productive users. They are also the most frustrated when:

1. An app's shortcut clashes with a system shortcut (e.g. `Cmd+K` conflicts with Spotlight or Arc browser)
2. They can't change it, so one of their two tools is permanently broken
3. They don't find out until they've committed to the app

LBM will solve all three:
- **Every shortcut is editable** — no hardcoded walls
- **Conflicts are detected before they save** — we check macOS, Windows, browser, and common app shortcuts
- **We warn, not block** — power users can override; beginners are protected

---

## Feature Specification

### 1. Shortcut Registry

A central in-memory registry owns every shortcut in the app. No shortcut is defined inline in code — they all flow through the registry.

```javascript
// ShortcutRegistry singleton

const SHORTCUTS = {
  // id              label                  default key     context
  "new-item":       { label: "New item",   key: "n",       ctx: "global" },
  "focus-search":   { label: "Search",     key: "/",       ctx: "global" },
  "toggle-help":    { label: "Show shortcuts", key: "?",   ctx: "global" },
  "close-panel":    { label: "Close / Dismiss", key: "Escape", ctx: "global" },
  "nav-down":       { label: "Next task",  key: "ArrowDown", ctx: "list" },
  "nav-up":         { label: "Prev task",  key: "ArrowUp",  ctx: "list" },
  "open-task":      { label: "Open task",  key: "Enter",   ctx: "list" },
  "delete-task":    { label: "Delete task", key: "d",      ctx: "list,detail" },
  "undo":           { label: "Undo",       key: "Meta+z",  ctx: "global" },
  // ... full list to be defined at implementation time
};
```

**Storage contract:**
- Default keys are baked into code
- User overrides are stored in `localStorage` under `lbm.shortcuts.overrides` as `{ [id]: string }`
- At runtime: `resolve(id)` returns override if present, else default
- Only overrides are persisted — not all defaults (keeps storage minimal and resets work cleanly)

---

### 2. Shortcut Settings UI

**Access point:** A dedicated "Shortcuts" tab or panel, accessible from:
- The `?` shortcuts panel (add a "Customise shortcuts" CTA at the bottom)
- A `Cmd+,` / `Ctrl+,` global shortcut (Settings)

**Layout:**

```
┌─ Keyboard Shortcuts ──────────────────────────────┐
│  [Search shortcuts...]              [Reset all]    │
│                                                    │
│  GLOBAL                                            │
│  ┌──────────────────┬──────────────┬─────────────┐│
│  │ New item         │ N            │ [Edit] [↺] ││
│  │ Search           │ /            │ [Edit] [↺] ││
│  │ Show shortcuts   │ ?            │ [Edit] [↺] ││
│  │ Undo             │ Cmd+Z        │ [Edit] [↺] ││
│  └──────────────────┴──────────────┴─────────────┘│
│                                                    │
│  LIST VIEW                                         │
│  ┌──────────────────┬──────────────┬─────────────┐│
│  │ Next task        │ ↓            │ [Edit] [↺] ││
│  │ ...              │ ...          │ ...         ││
│  └──────────────────┴──────────────┴─────────────┘│
│                                                    │
│  [Import profile]  [Export profile]                │
└────────────────────────────────────────────────────┘
```

**Row states:**
- Default: shows default key, `[Edit]` + grayed-out `[↺]`
- Customised: shows custom key (highlighted), `[Edit]` + active `[↺]` reset button
- Recording: input glows, shows "Press a key..." prompt
- Conflict: shows warning banner below the row

---

### 3. Shortcut Recorder

When the user clicks `[Edit]` on a shortcut row:

1. Row enters **recording mode** — key display shows "Press a key..."
2. Next keydown event is captured (prevent default, don't bubble)
3. Display the captured key combination
4. Run conflict check (see Section 4)
5. If no conflict: show `[Save]` / `[Cancel]` buttons
6. If conflict: show warning banner — user can still `[Save anyway]` or `[Cancel]`
7. On save: write to `lbm.shortcuts.overrides` in localStorage and refresh all bound tooltips/panels

**Cancellation:** `Esc` during recording cancels, `Esc` after recording cancels, clicking outside cancels.

**Edge cases:**
- `Esc` itself: always cancels recording — it cannot be reassigned (it is the universal cancel key)
- Function keys: allowed and conflict-checked
- `Meta` alone, `Shift` alone, `Alt` alone: blocked — modifiers without a base key are not valid shortcuts
- System-only keys (`PrintScreen`, `CapsLock`): blocked with a clear message

---

### 4. Conflict Detection System

This is the core of the USP. Three layers of conflict detection, applied in order:

#### Layer 1 — Internal LBM Conflicts

Check every registered shortcut. If the new key matches an existing one (same context or global), flag it:

```
⚠ This key is already used in LBM for "Delete task".
  Saving will reassign it — "Delete task" will have no shortcut.
  [Save anyway]  [Cancel]
```

Severity: **High** — always shown. User can override.

---

#### Layer 2 — Browser Reserved Shortcuts

A curated, hard-coded list of shortcuts the browser intercepts before the page can catch them. These physically cannot work as page shortcuts:

| Key | Browser action |
|---|---|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Ctrl+R` / `F5` | Reload |
| `Ctrl+L` | Address bar focus |
| `Ctrl+N` | New window |
| `Ctrl+Shift+T` | Reopen closed tab |
| `Ctrl+Tab` | Cycle tabs |
| `Alt+F4` (Win) | Close window |
| `Cmd+,` (Mac) | App preferences |
| `Cmd+M` (Mac) | Minimise |
| `Cmd+H` (Mac) | Hide |
| `Cmd+Q` (Mac) | Quit |
| ... | (full list at implementation — target ~40 entries) |

```
🚫 This shortcut is reserved by the browser and cannot be intercepted.
   Pressing it will [open a new tab / reload the page] instead.
   Choose a different key.
   [Cancel]
```

Severity: **Blocking** — cannot be saved. The key literally won't work.

---

#### Layer 3 — OS Reserved Shortcuts

Shortcuts the operating system intercepts before the browser can. We detect the OS at runtime (`navigator.platform`) and check the relevant list:

**macOS (~50 entries):**

| Key | macOS action |
|---|---|
| `Cmd+Space` | Spotlight |
| `Cmd+Tab` | App switcher |
| `Cmd+Shift+4` | Screenshot |
| `Cmd+Shift+5` | Screenshot options |
| `Ctrl+Up` | Mission Control |
| `Ctrl+Down` | App Exposé |
| `Ctrl+Left/Right` | Switch spaces |
| ... | |

**Windows (~40 entries):**

| Key | Windows action |
|---|---|
| `Win+D` | Show desktop |
| `Win+L` | Lock screen |
| `Alt+Tab` | App switcher |
| `Win+Tab` | Task View |
| `PrintScreen` | Screenshot |
| ... | |

```
⚠ This shortcut may conflict with macOS.
   Cmd+Space is used by Spotlight (System Search).
   Pressing it may trigger macOS instead of LBM.
   [Save anyway]  [Cancel]
```

Severity: **Warning** — shown, but user can override. Some users reassign OS shortcuts.

---

#### Layer 4 — Future: Common App Conflicts (Phase 2)

Optional layer for "frequent conflict apps" — apps that are commonly open alongside LBM:

- Arc / Chrome (browser shortcuts beyond Layer 2)
- Notion (`Cmd+K`, `Cmd+Shift+P`)
- VS Code (`Cmd+P`, `Cmd+Shift+P`)
- Figma (`V`, `F`, `R`, `H`)

Approach: ship a curated database of known conflicts per app. User can toggle which apps they use (stored in preferences). Default: show only if it's a universally common shortcut.

---

### 5. Dynamic UI Updates

When a shortcut changes, all bound UI elements must update immediately — no page reload:

- **Tooltips** (`.shortcut-tooltip` spans): re-render the `<kbd>` content from the registry
- **Shortcuts panel** (`#shortcutsPanel`): re-render rows from the registry
- **Docs/help text**: where shortcuts are mentioned, they should pull from the registry dynamically

**Implementation pattern:**

```javascript
// Subscribe to shortcut changes
ShortcutRegistry.on("change", (id, newKey) => {
  document.querySelectorAll(`[data-shortcut="${id}"]`).forEach(el => {
    el.textContent = formatKey(newKey);
  });
});
```

Every `<kbd>` and shortcut display element gets a `data-shortcut="id"` attribute at implementation time.

---

### 6. Import / Export Shortcut Profiles

Users can export their full shortcut configuration as a `.json` file and import it on another device.

```json
{
  "lbm_shortcut_profile": true,
  "version": 1,
  "created": "2026-04-02",
  "overrides": {
    "new-item": "a",
    "delete-task": "x"
  }
}
```

**Export:** Serialise `lbm.shortcuts.overrides` from localStorage as a download.
**Import:** File picker → validate schema → merge into `lbm.shortcuts.overrides` → re-render UI.

This is a Pro feature candidate (cloud profile sync in Pro version).

---

## Implementation Phases

### Phase 0 — Foundation (required before any UI)

- [ ] Define full shortcut ID list (audit every current shortcut in `task-app.js`)
- [ ] Build `ShortcutRegistry` singleton (defaults, overrides, resolve, set, reset)
- [ ] Refactor `task-app.js` key handler to read from registry instead of hardcoded strings
- [ ] Add `data-shortcut="id"` to every `<kbd>` element in the UI

**Estimate:** Medium complexity. Must be done right — this is the load-bearing layer.

---

### Phase 1 — Settings UI

- [ ] Build the Shortcuts settings panel (HTML + CSS)
- [ ] Render rows dynamically from registry
- [ ] Shortcut recorder (click to record, capture keydown)
- [ ] Internal conflict detection (Layer 1)
- [ ] Save to localStorage, update UI dynamically

**Estimate:** Medium complexity. Visually significant — needs design tokens applied carefully.

---

### Phase 2 — Conflict Detection

- [ ] Compile browser reserved shortcut list (research + test across Chrome, Firefox, Arc, Edge)
- [ ] Compile macOS reserved shortcut list (test on macOS)
- [ ] Compile Windows reserved shortcut list (test on Windows)
- [ ] OS detection at runtime
- [ ] Conflict warning UI (banner below row with severity-appropriate styling)

**Estimate:** Research-heavy. The list curation is the hard part, not the code.

---

### Phase 3 — Polish & Pro Features

- [ ] Import / Export profile (JSON)
- [ ] Search/filter shortcuts panel
- [ ] "Reset all to defaults" with confirmation
- [ ] Shortcut discovery: contextual tooltip system (show shortcut hint when hovering a button for 1s)
- [ ] Shortcut cheat sheet printable page (or PDF export)
- [ ] Common app conflicts database (Phase 2 layer — optional flag per app)

---

## Conflict Database — Research Notes

**Sources to compile the database from:**
- macOS: System Settings > Keyboard > Keyboard Shortcuts (document all defaults)
- Windows: Microsoft Docs keyboard shortcut reference
- Chrome: chrome://settings/ and Chrome keyboard shortcuts page
- Firefox / Arc / Edge: test manually

**Target counts:**
- Browser reserved (blocking): ~40 entries
- macOS reserved (warning): ~50 entries
- Windows reserved (warning): ~40 entries
- Total: ~130 entries in v1 database

**Format:**
```javascript
const BROWSER_RESERVED = new Map([
  ["Ctrl+T",           "Open a new tab"],
  ["Ctrl+W",           "Close the current tab"],
  // ...
]);

const MACOS_RESERVED = new Map([
  ["Meta+Space",       "Spotlight search"],
  ["Meta+Tab",         "Switch apps"],
  // ...
]);
```

---

## Marketing / USP Notes

**Positioning:** No other local-first task manager has this.

**Audience:** Power users who live on the keyboard — developers, designers, writers, business operators.

**Copy ideas:**
- *"Every shortcut is yours to own."*
- *"We checked 130+ system shortcuts so you never hit a dead key."*
- *"Conflict-aware shortcut customisation — a first in local task management."*
- *"Your shortcuts. Your muscle memory. Your productivity."*

**Where to surface in marketing:**
- Landing page feature section (with an animated demo of the conflict warning)
- Product Hunt launch copy
- YouTube demo video (show a conflict warning appearing — it's visually satisfying)
- README comparison table vs. competitors (mark "Custom shortcuts" ✓ for LBM, ✗ for others)

---

## Open Decisions

- [ ] Should `Esc` be re-assignable? (Current recommendation: No — it's the universal cancel key and too dangerous to reassign)
- [ ] Should we block browser-reserved shortcuts entirely (no "save anyway") or warn and allow? (Current recommendation: Block — they literally don't work)
- [ ] Pro feature or free feature? (Current recommendation: Free — it's a USP that attracts users. Reserve profile sync for Pro)
- [ ] Shortcut profiles as named presets? (e.g. "Notion-like", "Vim-like") — probably Phase 3+
- [ ] Should shortcuts panel be a full page or a modal? (Current: modal to keep the footprint light)

---

## Version Log

```
2026-04-02 — v0.1 — Initial plan drafted. Full spec written.
             Decision: Free feature, conflict-aware, three layers.
             Phase structure defined.
```
