# About Skills

Skills are machine-readable instruction files for Claude Code. While the docs in this hub are written for humans to read, skills are written for an AI to execute — step-by-step playbooks that tell Claude exactly how to perform a specific task in this project.

You do not need to read skills to use LBM. But if you are working with Claude Code to extend or maintain this project, skills are what make Claude reliable and repeatable across sessions.

---

## The Difference Between Docs and Skills

| | Documentation | Skills |
|---|---|---|
| **Written for** | You — the human user | Claude Code — the AI assistant |
| **Purpose** | Understanding how things work | Executing a specific task correctly |
| **Tone** | Explanatory, readable | Precise, directive |
| **When used** | When you want to learn something | When Claude is about to do something |

Think of docs as a user manual. Skills are the AI's operating procedure — like a checklist a pilot follows before takeoff.

---

## How Skills Work

When you ask Claude to do something in this project — add a keyboard shortcut, create a task, write new CSS — Claude reads the matching skill file before taking any action.

The skill file tells Claude:

- What files to read first
- What rules to follow (e.g. the 5-location shortcut rule)
- What pitfalls to avoid
- How to verify the work is correct

Without skills, Claude relies on general knowledge and may miss project-specific conventions. With skills, Claude follows the same process every time — the same way a seasoned developer would.

---

## Skills in This Project

### LBM Development Guide

**File:** `SKILL.md`

The master skill for adding features, updating styles, and extending the task tracker. It covers the file map, component rules, how to write new JavaScript without breaking existing patterns, and the documentation sync rule.

Read this skill before starting any development session on LBM.

---

### Add a Keyboard Shortcut

**File:** `SKILL_ADD_SHORTCUT.md`

Every keyboard shortcut in LBM must be registered in exactly five places. This skill walks Claude through all five locations — the key handler, the styles, the HTML shortcuts panel, the markdown doc, and the docs content cache — so nothing gets missed.

This skill exists because shortcut additions that skip any of these five steps create bugs that are hard to diagnose later.

---

### Front-End Design Skill

**File:** `DESIGN_SKILL.md`

The canonical reference for all visual decisions in LBM. It documents the type scale, spacing grid, color system, component patterns, motion rules, and accessibility requirements — drawn from Linear, shadcn/ui, Material Design 3, and Apple HIG.

Claude reads this before writing or editing any CSS, so design decisions stay consistent with the system already in place.

---

### Add a Task via Claude

**File:** `SKILL_ADD_TASK.md`

A skill for creating LBM tasks from natural language during any Claude Code session. When you say something like "add this to the task board", Claude uses this skill to infer the right urgency, value, area, and lane — then generates the `window.LBM.addTask()` console command for you to paste into the browser.

---

### Claude Integration Guide

**File:** `CLAUDE_INTEGRATION_GUIDE.md`

How to use LBM alongside other development projects without switching workspaces. Covers the two-tab workflow, cross-project task logging via the browser console API, and the rules Claude should follow when it is working in a non-LBM session but needs to log something to the board.

---

## Viewing Skills

Skills are listed in the **Skills** section of the left-hand sidebar. You can click any skill to read it in full, just like a document.

They are displayed here for transparency — so you can see exactly what instructions Claude is following when it works in this project.

---

## Adding or Customising Skills

Skills are plain Markdown files in the root of the LBM folder. To add a new skill:

1. Create a `.md` file in the project root (e.g. `SKILL_MY_TASK.md`)
2. Write clear, directive instructions — what to read first, what rules to follow, what to verify
3. Add an entry to the `skills` array in `data/project-data.js`
4. Add a matching entry to `data/docs-content.js` so it appears in the viewer

To trigger a skill, simply mention the task in a Claude Code session. If you have a `CLAUDE.md` file in the project root, you can add trigger phrases there so Claude picks up the right skill automatically.

---

## A Note on Keeping Skills Up to Date

Skills go stale when the codebase changes but the skill file does not. After any significant refactor or feature addition, check whether the relevant skills need updating.

The rule of thumb: if you would update the user docs, you should also update the skill that governs the same area.
