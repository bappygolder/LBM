# Voice Input

LBM includes a microphone button in the New Task modal for hands-free task title entry. Speak your task naturally — the title auto-fills, and urgency and area are inferred from keywords in your speech.

---

## How to Use

1. Press **N** or click **+ New Task**
2. Click the **microphone icon** next to the Title field
3. Speak your task — e.g. "Fix the critical auth bug in the login flow"
4. The title auto-fills with your speech
5. Urgency and Area selects update automatically based on keywords
6. Review and adjust anything if needed, then save

---

## Visual States

| State | Appearance |
|---|---|
| Idle | Mic icon, muted color |
| Listening | Purple mic, pulsing ring animation |
| Error | Red mic, resets after 1.5s |
| Unsupported | Dimmed mic, disabled (Firefox) |

Click the button while listening to stop recording early.

---

## Browser Support

| Browser | Voice Input |
|---|---|
| Chrome | Supported |
| Edge (Chromium) | Supported |
| Safari | Partial (may require mic permission prompt) |
| Firefox | Not supported (Web Speech API unavailable) |

In unsupported browsers, the mic button is visible but disabled with a tooltip.

---

## Urgency Keywords

These words in your spoken title automatically adjust the Urgency field:

| Keyword | Urgency |
|---|---|
| "critical", "blocker", "blocking", "urgent", "ASAP", "emergency" | 5 — Critical |
| "important", "high priority", "soon", "immediately" | 4 — High |
| "when I get to it", "low priority", "someday", "eventually" | 2 — Low |
| "nice to have", "optional", "minor", "low" | 1 — Minimal |
| (no keyword) | 3 — Medium (default) |

---

## Area Keywords

These words automatically select the correct Area:

| Keyword | Area |
|---|---|
| "doc", "docs", "documentation", "readme", "guide", "write-up" | Docs |
| "security", "auth", "authentication", "permission", "access", "SSL", "cert" | Security |
| "design", "UI", "UX", "layout", "style", "CSS", "color", "font" | UI/UX |
| "platform", "infra", "infrastructure", "deploy", "server", "build", "CI", "CD" | Platform |
| "release", "version", "ship", "launch", "publish" | Release |
| "product", "feature", "workflow", "user story" | Product |
| (no keyword) | No change (keeps current selection) |

---

## Tips

- Speak the urgency word naturally — "Fix the **critical** login bug" works just as well as "**Critical**: fix login bug"
- You can always edit the inferred values before saving
- If the title picks up extra words, click the field and edit directly — the inferred urgency/area selections stay
- Say the task title only — notes and other details are better typed manually
- For longer, structured tasks, use Claude instead: "Add this to the task board: [description]" — Claude infers all fields and generates a console command. See [AI Task Creation](docs.html?doc=docs/AI_TASK_CREATION.md).
