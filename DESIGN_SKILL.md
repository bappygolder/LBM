# DESIGN_SKILL.md — LBM Front-End Design Reference

This file is the canonical design reference for the Local Business Manager project.
Read it in full before doing any CSS, component, or UI work.

---

## 1. When to Read This File

Read this file before:
- Writing or editing CSS in `styles.css`
- Adding or modifying any component's HTML structure
- Choosing colors, spacing values, font sizes, or border radii
- Adding new animations or transitions
- Creating a new UI pattern that doesn't have a clear existing precedent

This file overrides generic advice. When this document and intuition conflict, follow this document.

---

## 2. LBM Design Philosophy

These principles are drawn from the best task/project management UIs in the industry (Linear, Vercel, Cron) and adapted to this project.

**Density-first.** Information should be visible without scrolling. Linear's principle: show more, not less. Every pixel of vertical space is precious. Avoid generous padding that hides content.

**Chrome should disappear.** UI furniture — borders, backgrounds, labels — should recede so content is the focus. If a border, shadow, or background isn't communicating something, remove it.

**One accent color, used sparingly.** `--accent` purple is the only interactive signal. It appears on active states, focus rings, and primary buttons. Never use it decoratively. When everything is purple, nothing is.

**Dark-only.** All decisions optimize for dark backgrounds. Never add `prefers-color-scheme: light` rules or light-mode variants unless explicitly requested.

**Keyboard-native.** Every action must be reachable by keyboard. This is a task manager for power users. Tab order, focus states, and keyboard shortcuts are first-class features, not afterthoughts.

**No loading states.** This is a local-first app. No spinners, skeletons, or fake latency patterns. State changes are instant.

**Never animate to fill time.** Animation exists to guide attention or communicate state change. If removing an animation makes the UI feel faster without losing clarity, remove it.

---

## 3. Color System

### 3a. Current Design Tokens

All colors live in `:root` in `styles.css`. Never use hardcoded hex values outside of `:root`.

| Variable | Value | Purpose |
|---|---|---|
| `--bg` | `#0f1016` | Page background — deepest layer |
| `--surface` | `rgba(22,23,34,0.75)` | Glassmorphic card surfaces |
| `--surface-solid` | `#161722` | Opaque variant for panels needing full opacity |
| `--surface-hover` | `rgba(38,39,55,0.85)` | Surface hover state |
| `--text` | `#f8f9fa` | Primary text |
| `--muted` | `#a1a1aa` | Secondary text, labels |
| `--muted-soft` | `#71717a` | Tertiary text, placeholders |
| `--accent` | `#8b5cf6` | Primary interactive color (purple) |
| `--accent-glow` | `rgba(139,92,246,0.4)` | Shadows and glows on accent |
| `--accent-hover` | `#a78bfa` | Accent hover state |
| `--accent-soft` | `rgba(139,92,246,0.12)` | Very soft accent background tint |
| `--done` | `#34d399` | Success / completed state (green) |
| `--done-soft` | `rgba(52,211,153,0.15)` | Success background tint |
| `--warn` | `#fbbf24` | Warning state (amber) |
| `--warn-soft` | `rgba(251,191,36,0.15)` | Warning background tint |
| `--danger` | `#ef4444` | Destructive / error state (red) |
| `--danger-soft` | `rgba(239,68,68,0.12)` | Error background tint |
| `--border` | `rgba(255,255,255,0.08)` | Default border |
| `--border-strong` | `rgba(255,255,255,0.13)` | Emphasized border (hover, active) |

Extended tokens live in `design-tokens.css` (imported at the top of `styles.css`):

| Variable | Value | Purpose |
|---|---|---|
| `--surface-deep` | `#13141f` | Deepest panel backgrounds (detail panel) |
| `--surface-overlay` | `#1c1d28` | Floating overlays (shortcuts panel) |
| `--accent-light` | `#c4b5fd` | Accent-tinted text on dark surfaces |
| `--accent-xsoft` | `rgba(139,92,246,0.06)` | Extremely subtle accent tint |
| `--text-secondary` | `#d4d4d8` | Between `--text` and `--muted` |

### 3b. Semantic Color Roles (Material Design 3 mapping)

| Role | Token | Meaning |
|---|---|---|
| `surface` | `--surface`, `--surface-solid` | Container for grouped content |
| `on-surface` (primary) | `--text` | Body text on surface |
| `on-surface` (secondary) | `--muted` | Labels, secondary info |
| `on-surface` (tertiary) | `--muted-soft` | Placeholders, hints |
| `primary` | `--accent` | Main interactive action |
| `on-primary` | white | Text on accent backgrounds |
| `primary-container` | `--accent-soft` | Soft accent backgrounds |
| `error` | `--danger` | Destructive actions, errors |
| `error-container` | `--danger-soft` | Error message backgrounds |
| `tertiary` | `--done` | Success, completion |
| `secondary` | `--warn` | Warning states |

### 3c. What NOT to Do

Never write a hex value directly inside a CSS selector. All colors must use `var(--token-name)`.

**Known violations to fix** (Tier 2 on the improvement checklist):
- `#13141f` used in detail panel → replace with `var(--surface-deep)`
- `#1c1d28` used in shortcuts panel → replace with `var(--surface-overlay)`
- `#c4b5fd` used in `.markdown-view h3` → replace with `var(--accent-light)`
- `#e2e8f0`, `#d4d4d8` used for text → replace with `var(--text-secondary)`

### 3d. OKLCH — Future Path

OKLCH is perceptually uniform: equal numeric steps produce equal perceptual changes, making it easy to generate consistent tints and shades. It's supported in all modern browsers (Chrome 111+, Safari 15.4+, Firefox 113+). This project is safe to use it.

OKLCH equivalents for reference when adding new colors:
- `#8b5cf6` (accent) → `oklch(60% 0.22 293)`
- `#0f1016` (bg) → `oklch(8% 0.01 264)`
- `#34d399` (done) → `oklch(78% 0.15 162)`
- `#ef4444` (danger) → `oklch(62% 0.22 27)`

Rule: any new color added to this project should use OKLCH syntax natively and be added to `:root` in `design-tokens.css`.

---

## 4. Typography Scale

### 4a. The Problem

The codebase currently has 17+ distinct font size values with no ratio or system. These sizes appear in the wild: 0.65, 0.67, 0.68, 0.7, 0.72, 0.75, 0.78, 0.8, 0.82, 0.84, 0.85, 0.875, 0.88, 0.9, 1.05, 1.2, 1.6rem. This creates inconsistency and makes resizing decisions arbitrary.

Use the scale below. Never introduce a new font size value outside this scale.

### 4b. The LBM Type Scale

8 steps based on a Minor Third ratio (×1.2), base at 14px.

| Token | rem | px | Typical use |
|---|---|---|---|
| `--text-2xs` | 0.625rem | 10px | Tiny badges, count bubbles |
| `--text-xs` | 0.6875rem | 11px | Section labels, ALL-CAPS metadata |
| `--text-sm` | 0.75rem | 12px | Chip text, property labels, timestamps |
| `--text-base` | 0.875rem | 14px | Body text, list items, form labels |
| `--text-md` | 1rem | 16px | Card titles, subheadings |
| `--text-lg` | 1.125rem | 18px | Panel section titles |
| `--text-xl` | 1.25rem | 20px | Stat numbers, brand name |
| `--text-2xl` | 1.5rem | 24px | Detail panel H1, page titles |

When migrating: sizes below 0.65rem should map up to `--text-2xs`. Sizes 0.67–0.72rem → `--text-xs`. Sizes 0.75–0.8rem → `--text-sm`. Sizes 0.82–0.9rem → `--text-base`.

### 4c. Line Height Rules

| Context | Line height |
|---|---|
| Single-line labels, chips, badges | `1.2` |
| Body text, descriptions, list items | `1.5` |
| Rich text / markdown / notes content | `1.75` |
| Headings, panel titles | `1.15` |

### 4d. Font Weight Rules

| Weight | Use |
|---|---|
| 400 | Body text, notes, descriptions |
| 500 | Interactive labels, form labels, nav items |
| 600 | Section headers, column titles, button labels |
| 700 | Page H1, stat numbers, brand name |

### 4e. Letter Spacing Rules

| Context | Value |
|---|---|
| Uppercase micro-labels (ALL CAPS) | `0.06em–0.09em` |
| Display / hero text (large sizes) | `-0.02em to -0.03em` (tight tracking) |
| Body text | `0` (default, no change) |

---

## 5. Spacing System

### 5a. The 4px Grid

The base unit is **4px**. Every spacing value (padding, margin, gap) must be a multiple of 4.

Valid values: 4, 8, 12, 16, 20, 24, 32, 40, 48px. Exceptions: 1px and 2px are acceptable for borders and outline offsets only.

### 5b. Spacing Tokens

Defined in `design-tokens.css`:

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

Use these tokens in new CSS. Migrate existing raw values gradually, not all at once.

### 5c. Known Spacing Violations to Fix (Tier 2)

- `padding: 11px 24px` (header) → `12px 24px`
- `padding: 7px 10px` (toolbar rows) → `8px 10px` or `8px 12px`
- `gap: 7px`, `gap: 9px` → `8px`
- `gap: 3px`, `gap: 5px` → `4px`

### 5d. Touch Target Minimum

All interactive elements must be at least **44×44px** on touch per Apple HIG and WCAG 2.5.5.

For elements that are visually smaller (like 30px icon buttons), use the padding trick:

```css
.icon-button {
  width: 30px;
  height: 30px;
  padding: 7px; /* expands click/touch area toward 44px */
  display: grid;
  place-items: center;
}
```

Or use `::after` with negative margins if resizing breaks layout.

**Current violations**: `.icon-button` (30px), `.detail-back-btn` (28px), `.brand-info-btn` icon (14px).

---

## 6. Component Patterns

### 6a. Buttons — 4 Tiers

| Tier | Class | When to use |
|---|---|---|
| Primary | `.btn-primary` | One primary action per view. "Save", "Create". Never more than one per form/group. |
| Secondary | `.btn-secondary` | Alternative actions. "Cancel", "Edit". |
| Ghost | button without explicit tier | Tertiary, contextual. Icon buttons, inline tools. |
| Danger | `.btn-danger` | Irreversible destructive actions only. "Delete". Confirm before executing. |

Rules:
- Min height: 32px (compact toolbar), 36px (normal panels). Never below 28px.
- Focus state: `box-shadow: 0 0 0 2px var(--accent-glow), 0 0 0 1px var(--accent)` on `:focus-visible`
- Do: use icon + label for ambiguous actions. Don't: use primary style for more than one button in a group.

### 6b. Icon Buttons

- Visual size: 30×30px. Always pair with `aria-label` or a tooltip.
- Focus state: same focus ring as buttons (currently missing — Tier 1 fix).
- Hover: subtle background lift using `--surface-hover`. Never color-only change.

### 6c. Inputs and Selects

- Focus ring: `border-color: var(--accent)` + `box-shadow: 0 0 0 3px rgba(139,92,246,0.1)` — already correct in most inputs.
- Placeholder: `--muted-soft` — already correct.
- Error state: `border-color: var(--danger)` + `box-shadow: 0 0 0 3px rgba(239,68,68,0.1)`.
- Min height: 36px for all text inputs and selects.
- Never use `outline: none` without providing a visible `box-shadow` substitute on `:focus-visible`.

### 6d. Cards and Surface Containers

| Surface type | Token | Use case |
|---|---|---|
| Glass card | `--surface` | Primary cards in list/board views |
| Solid panel | `--surface-solid` | Panels needing full opacity |
| Deep panel | `--surface-deep` | Detail panel, deepest content layer |
| Overlay | `--surface-overlay` | Floating overlays, shortcuts panel |

Rules:
- Border default: `1px solid var(--border)`. On hover/focus: `var(--border-strong)`.
- Radius: `--radius-md` (10px) for cards, `--radius-lg` (14px) for modals and panels.
- **Never stack more than 2 levels of glass.** A glassmorphic card inside a glassmorphic modal is visually noisy.
- Avoid heavy `box-shadow` values — shadows above `0 16px 40px` feel dense and dated.

### 6e. Badges and Chips

- Shape: pill (`border-radius: var(--radius-pill)`) for status badges; `--radius-xs` (4px) for property chips.
- Padding: `4px 8px` for pill badges; `2px 6px` for inline chips.
- Font: `--text-xs` (11px), weight 500–600.
- Never use a chip where a color-only dot would suffice. Don't add noise.

### 6f. Modals and Overlays

- Backdrop: `rgba(0,0,0,0.55)` + `backdrop-filter: blur(4px)` — already correct.
- Close on Escape and backdrop click — already implemented.
- **Focus trap required**: keyboard tab must cycle through modal elements only, not reach content behind the modal. Currently not implemented — flag as a Tier 1 gap for modals that contain forms.
- Animation: scale `0.97→1` + opacity `0→1`, 200ms ease — already correct.

### 6g. Dropdown and Popover Menus

Based on shadcn/Radix patterns:
- Entry animation: `translateY(4px) → translateY(0)` + opacity, 120ms ease-out.
- Border: `var(--border-strong)`.
- Shadow: `0 8px 24px rgba(0,0,0,0.4)`.
- Min width: 160px.
- Item height: 32px, padding `0 12px`.
- Separator: `1px solid var(--border)`, `margin: 4px 0`.

---

## 7. Motion and Animation

### 7a. Duration Scale

| Duration | Use case |
|---|---|
| 80–100ms | Hover color/background changes |
| 120–150ms | Icon reveals, opacity fades, tooltip appear |
| 200ms | Component entry (badge, chip appearing) |
| 220–280ms | Panel slides, modal enters, drawer opens |
| 300ms | Tab indicator slide (intentionally bouncy) |
| **Never >400ms** | Except deliberate storytelling (onboarding, celebration) |

### 7b. Easing Reference

| Easing | CSS value | When to use |
|---|---|---|
| Standard | `cubic-bezier(0.4, 0, 0.2, 1)` | Position/transform changes (default for most) |
| Accelerate | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations — element leaving view |
| Decelerate | `cubic-bezier(0, 0, 0.2, 1)` | Entry animations — element entering view |
| Linear | `linear` | Continuous loops (progress bars, loading) only |
| `ease` (CSS default) | — | **Avoid** — too slow at start, creates sluggish feel |

Motion tokens in `design-tokens.css`: `--duration-fast`, `--duration-normal`, `--duration-slow`, `--duration-page`, `--ease-standard`, `--ease-exit`, `--ease-enter`.

### 7c. What NOT to Animate

- **Layout shift (height/width)**: causes reflow, janky on all browsers. Use opacity + transform instead.
- **`filter: blur()` on large surfaces**: extremely GPU-expensive on mobile. Only use on small elements.
- **Color changes over 150ms**: makes the UI feel slow and syrupy.
- **List entry animations on >10 items**: staggered animations on long lists feel excessive and delay interaction.
- **Anything on every render**: only animate state transitions, not passive renders.

### 7d. `prefers-reduced-motion` (Required)

The `prefers-reduced-motion` media query is handled globally in `design-tokens.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This disables all animation for users who have requested reduced motion in their OS settings. It is already included in `design-tokens.css`. Do not add redundant `prefers-reduced-motion` blocks elsewhere.

---

## 8. Accessibility

### 8a. WCAG 2.1 AA Contrast Requirements

- Body text (under 18px or 14px bold): minimum **4.5:1** contrast ratio
- Large text (18px+ or 14px bold): minimum **3:1**
- Non-text UI elements (icons, borders conveying info): minimum **3:1**

Current status of LBM tokens:
- `--text` (#f8f9fa on #0f1016): ~18:1 — passes
- `--muted` (#a1a1aa on #0f1016): ~7:1 — passes
- `--muted-soft` (#71717a on #0f1016): ~4.55:1 — marginally passes. **Do not darken further.**
- Accent text on dark: verify individually — purple text on dark backgrounds is a risk area

### 8b. Focus States — Current Violations (Tier 1)

Every interactive element **must** show a visible focus indicator on `:focus-visible`. Never use `outline: none` without providing a `box-shadow` substitute.

The standard focus ring for this project:

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-glow), 0 0 0 1px var(--accent);
}
```

**Known violations to fix:**
1. `.brand-name:focus-visible` — `outline: none; box-shadow: none` — completely removes focus visibility
2. `.search-input:focus-visible` — `outline: none; box-shadow: none` — same
3. `.detail-prop-select:focus` — `outline: none` with no substitute
4. All `.icon-button` elements — missing `:focus-visible` rules entirely

### 8c. Required ARIA Attributes

| Element | Required attributes |
|---|---|
| View toggle (List/Board) | `role="tablist"`, each tab has `role="tab"`, `aria-selected` — already correct |
| Delete confirm modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title |
| Board columns | `aria-label` with the lane name |
| Icon-only buttons | `aria-label` describing the action (many already have this — audit remaining ones) |
| Decorative SVG icons | `aria-hidden="true"` — already done in many places, verify all icons |

### 8d. Screen Reader Utility

The `.sr-only` class is defined in `design-tokens.css` and makes an element visually hidden but readable by screen readers. Use it for:
- Labels on icon-only button groups
- Skip-to-content links
- Off-screen text that provides context

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 9. Reference Sources

Study these for design decisions. When adding a new component type, look at how these systems handle it first.

| Source | What to study |
|---|---|
| [Linear.app](https://linear.app) | Row density, keyboard-first patterns, minimal chrome, dark mode done right |
| [Vercel Dashboard](https://vercel.com/dashboard) | Card system, dark mode surfaces, info density, status chip patterns |
| [shadcn/ui](https://ui.shadcn.com) | Component variants, focus ring patterns, accessible HTML structure |
| [Radix UI Primitives](https://www.radix-ui.com) | Modal/dialog/popover ARIA patterns, accessible dropdown implementation |
| [Material Design 3](https://m3.material.io) | Color roles, spacing system, elevation and depth model |
| [Apple HIG](https://developer.apple.com/design/human-interface-guidelines) | Touch targets, motion guidelines, SF Pro reference, accessibility |
| [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref) | Pass/fail criteria for any accessibility question |

---

## 10. LBM Improvement Checklist

Work through this list gradually across sessions. Do not fix everything at once.

### Tier 1 — Critical (accessibility and correctness)

- [ ] Fix `.brand-name:focus-visible` — replace `outline: none; box-shadow: none` with the standard focus ring
- [ ] Fix `.search-input:focus-visible` — same fix
- [ ] Fix `.detail-prop-select:focus` — add `box-shadow` focus ring
- [ ] Add `:focus-visible` rules to all `.icon-button` elements
- [ ] Fix `var(--text-2)` undefined variable in `.shortcuts-fab` → `var(--muted)` *(already done in styles.css)*
- [ ] Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to the delete confirm overlay
- [ ] Audit all icon-only buttons for `aria-label` presence

### Tier 2 — Important (design consistency)

- [ ] Replace hardcoded `#13141f` with `var(--surface-deep)` in detail panel styles
- [ ] Replace hardcoded `#1c1d28` with `var(--surface-overlay)` in shortcuts panel styles
- [ ] Replace hardcoded `#c4b5fd` with `var(--accent-light)` in `.markdown-view h3`
- [ ] Replace `#e2e8f0`, `#d4d4d8` text colors with `var(--text-secondary)`
- [ ] Begin migrating font sizes to the 8-step type scale (start with new code, migrate old gradually)
- [ ] Begin using spacing tokens (`--space-*`) in new CSS rules
- [ ] Replace hardcoded `border-radius: 4px` values with `var(--radius-xs)`
- [ ] Fix known spacing violations (11px → 12px, 7px → 8px, etc.)

### Tier 3 — Polish (nice-to-have)

- [ ] Increase touch targets for `.icon-button` and `.detail-back-btn` to 44px minimum
- [ ] Add a medium breakpoint at `1024px` for tablet layout improvements
- [ ] Standardize remaining spacing values not yet on the 4px grid
- [ ] Consider using OKLCH for any new color additions
- [ ] Audit decorative SVG icons for missing `aria-hidden="true"`
- [ ] Add focus trap logic to modals that contain form inputs
