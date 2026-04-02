# Shortcut Management System

> **Status: Planned — not yet built.**
> This is a full feature specification for one of our most ambitious planned features.
> Implementation phases are defined. Development begins after core v1 stability work is complete.

---

## The Idea

Most apps treat keyboard shortcuts as hardcoded plumbing — invisible to the user, impossible to change, and a constant source of conflict with OS shortcuts and other tools.

LBM will be different.

**Every action in LBM will have a keyboard shortcut. Every shortcut will be user-editable. Every change will be conflict-checked against the system before it saves.**

No other local-first task manager has done this. We intend to be the first to ship conflict-aware, fully customisable shortcuts as a first-class feature.

---

## The Problem We're Solving

Users who rely on keyboard shortcuts are the most productive users. They're also the most frustrated when:

- An app's shortcut clashes with a system shortcut (e.g. a key that works in LBM silently triggers macOS Spotlight instead)
- They can't change it, so one of their tools is permanently broken
- They don't find out until after they've committed to the app

LBM solves all three:
- Every shortcut is editable
- Conflicts are detected before they save
- We warn, not block — power users can override; beginners are protected

---

## Feature Specification

### 1. Shortcut Registry

A central in-memory registry owns every shortcut in the app. No shortcut is hardcoded inline — they all flow through the registry.

Each shortcut has an ID, a label, a default key, and a context. User overrides are stored separately in `localStorage` under `lbm.shortcuts.overrides` as a `{ [id]: key }` map.

At runtime, `registry.resolve(id)` returns the user's override if one exists, otherwise the default. Only overrides are persisted — this keeps storage minimal and makes "reset to default" work cleanly.

---

### 2. Shortcut Settings UI

A dedicated "Shortcuts" panel, accessible from:
- A "Customise shortcuts" link at the bottom of the existing `?` shortcuts panel
- `Cmd+,` / `Ctrl+,` (Settings shortcut)

**Layout:**

```
┌─ Keyboard Shortcuts ──────────────────────────────┐
│  [Search shortcuts...]              [Reset all]    │
│                                                    │
│  GLOBAL                                            │
│  ┌──────────────────┬──────────────┬─────────────┐ │
│  │ New item         │ N            │ Edit  Reset  │ │
│  │ Search           │ /            │ Edit  Reset  │ │
│  │ Show shortcuts   │ ?            │ Edit  Reset  │ │
│  └──────────────────┴──────────────┴─────────────┘ │
│                                                    │
│  LIST VIEW                                         │
│  ┌──────────────────┬──────────────┬─────────────┐ │
│  │ Next task        │ ↓            │ Edit  Reset  │ │
│  └──────────────────┴──────────────┴─────────────┘ │
│                                                    │
│  [Import profile]  [Export profile]                │
└────────────────────────────────────────────────────┘
```

Customised shortcuts are visually highlighted in the panel. The reset button is grayed out on rows that are still at their default.

---

### 3. Shortcut Recorder

When the user clicks Edit on a shortcut row, the row enters recording mode:

1. Key display shows "Press a key..."
2. Next `keydown` event is captured (prevents default, doesn't bubble)
3. The captured combination is displayed
4. Conflict check runs immediately (see below)
5. If no conflict: Save / Cancel buttons appear
6. If conflict: a warning banner appears below the row — user can still save anyway or cancel

`Esc` during recording always cancels. `Esc` itself cannot be reassigned — it's the universal cancel key.

Modifiers alone (`Shift`, `Meta`, `Alt`) without a base key are blocked. System-intercepted keys (`CapsLock`, `PrintScreen`) are blocked with a clear message.

---

### 4. Conflict Detection

Three layers, applied in order:

**Layer 1 — Internal LBM conflicts**

Checks every registered shortcut. If the new key matches an existing one (in the same context or globally), a warning is shown. Severity: High. User can override (the other shortcut loses its binding).

**Layer 2 — Browser-reserved shortcuts**

A curated list of keys the browser intercepts before the page can catch them. These literally cannot work as page shortcuts.

Examples: `Ctrl+T` (new tab), `Ctrl+W` (close tab), `Ctrl+R` (reload), `Ctrl+L` (address bar), `Cmd+Q` (quit), `Cmd+M` (minimise).

Target list: ~40 entries. Severity: **Blocking** — cannot be saved. The key won't work physically.

**Layer 3 — OS-reserved shortcuts**

Shortcuts the operating system intercepts before the browser. We detect the OS at runtime and check the relevant list:

- **macOS** (~50 entries): `Cmd+Space` (Spotlight), `Cmd+Tab` (app switcher), `Cmd+Shift+4` (screenshot), `Ctrl+Up` (Mission Control), etc.
- **Windows** (~40 entries): `Win+D` (show desktop), `Win+L` (lock screen), `Alt+Tab` (app switcher), etc.

Severity: **Warning** — shown, but user can override. Some users deliberately reassign OS shortcuts.

**Future — Layer 4: Common app conflicts**

Optional database of shortcuts used by apps commonly open alongside LBM (Notion, VS Code, Figma). Configurable — users opt in per app. This is a Phase 3 addition.

---

### 5. Dynamic UI Updates

When a shortcut changes, all bound UI elements update immediately — no page reload.

Every `<kbd>` element and shortcut display gets a `data-shortcut="id"` attribute. When the registry emits a change event, all elements with that ID re-render their displayed key.

This means the `?` shortcuts panel, tooltips on buttons, and any inline shortcut hints always reflect the user's current bindings.

---

### 6. Import / Export Shortcut Profiles

Users can export their full configuration as a `.json` file and import it on another device.

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

Export: downloads `lbm.shortcuts.overrides` from localStorage as a file.
Import: file picker → validate schema → merge overrides → re-render UI.

Cloud profile sync (same overrides across devices automatically) is a Pro feature.

---

## Implementation Phases

### Phase 0 — Foundation

- Audit every current shortcut in `task-app.js`, assign each an ID
- Build the `ShortcutRegistry` singleton (defaults, overrides, resolve, set, reset, events)
- Refactor `task-app.js` key handler to read from registry instead of inline strings
- Add `data-shortcut="id"` to every `<kbd>` element in the UI

This phase has no visible user-facing changes. It's the load-bearing layer.

### Phase 1 — Settings UI

- Build the Shortcuts settings panel (HTML + CSS)
- Render rows dynamically from the registry, grouped by context
- Implement shortcut recorder (click to record, capture keydown, save/cancel)
- Internal conflict detection (Layer 1)
- Save to localStorage, re-render UI dynamically

### Phase 2 — Conflict Detection

- Compile the browser-reserved shortcut list (~40 entries, tested across Chrome, Firefox, Arc, Edge)
- Compile the macOS reserved list (~50 entries, tested on macOS)
- Compile the Windows reserved list (~40 entries, tested on Windows)
- OS detection at runtime (`navigator.platform` / `navigator.userAgentData`)
- Conflict warning UI with severity-appropriate styling

### Phase 3 — Polish

- Import / Export profile as JSON
- Search / filter in the shortcuts panel
- "Reset all to defaults" with confirmation
- Shortcut discovery: contextual hint on button hover after 1 second
- Common app conflicts database (Layer 4 — optional per-app flags)

---

## Open Questions

- Should `Esc` be reassignable? (Current position: No — too risky, universal cancel)
- Browser-reserved shortcuts: block entirely, or warn and allow? (Current position: Block — they literally don't work)
- Free or Pro feature? (Current position: Free — it's the hook. Pro extension = cloud profile sync)
- Named shortcut presets (e.g. "Vim-like", "Notion-like")? Probably Phase 3 or later
- Full page or modal for the settings panel? (Current position: modal, keeps footprint light)
