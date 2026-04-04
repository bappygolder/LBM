window.MCCProjectData = {
  project: {
    name: "LBM",
    fullName: "Local Business Manager",
    reviewedOn: "2026-03-31",
    maintainedBy: "Bappy Golder",
    summary:
      "Local Business Manager v1 — standalone, self-contained browser-based task tracker. Open index.html to get started."
  },
  tracker: {
    storageKey: "ltm-task-tracker-v1",
    seedVersion: "2026-03-30-r2",
    installToken: "lbm-2026-04-04-r1",
    recommendedByLabel: "Codex (GPT-5)",
    areas: [
      "project-system",
      "docs",
      "product",
      "platform",
      "release",
      "security",
      "ui-ux"
    ],
    tasks: [
      {
        id: "MCC-001",
        title: "Replace copied tracker content with a Mac Control Center workspace",
        notes:
          "Remove foreign project references, rebuild the local tracker shell, and make this folder a reusable project-management layer for this repo.",
        status: "done",
        priority: "P0",
        area: "project-system",
        source: "user-requested",
        recommendedBy: "",
        references: ["docs/LOCAL_PROJECT_SYSTEM.md"]
      },
      {
        id: "MCC-002",
        title: "Create a clean documentation baseline for the project",
        notes:
          "Build a real docs index, architecture docs, release notes, persistence guide, and task-tracker workflow docs tailored to this app.",
        status: "done",
        priority: "P0",
        area: "docs",
        source: "user-requested",
        recommendedBy: "",
        references: ["../docs/README.md", "../docs/PROJECT_OVERVIEW.md"]
      },
      {
        id: "MCC-003",
        title: "Document how persistence works across app state and tracker state",
        notes:
          "Clarify what lives in config.json, what lives in UserDefaults, and what the browser tracker stores only in localStorage.",
        status: "done",
        priority: "P0",
        area: "docs",
        source: "user-requested",
        recommendedBy: "",
        references: ["docs/PERSISTENCE_AND_STATE.md"]
      },
      {
        id: "MCC-004",
        title: "Define the local-to-online tracker sync workflow",
        notes:
          "Choose the online system, decide whether the repo or the online tracker is the source of truth, and build a lightweight export/import habit before automation.",
        status: "todo",
        priority: "P1",
        area: "project-system",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["docs/LOCAL_PROJECT_SYSTEM.md"]
      },
      {
        id: "MCC-005",
        title: "Add duplicate shortcut validation for action creation and editing",
        notes:
          "Prevent or warn on `Cmd + [Key]` conflicts so one action does not silently shadow another.",
        status: "todo",
        priority: "P1",
        area: "product",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/ACTION_SYSTEM.md"]
      },
      {
        id: "MCC-006",
        title: "Add import, export, and reset controls for action config",
        notes:
          "Expose safe backup and restore flows for `config.json` from the app UI instead of requiring filesystem work.",
        status: "todo",
        priority: "P1",
        area: "product",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/ACTION_SYSTEM.md", "docs/PERSISTENCE_AND_STATE.md"]
      },
      {
        id: "MCC-007",
        title: "Replace AppleScript launch-at-login with a modern macOS approach",
        notes:
          "Review ServiceManagement-based options and reduce brittleness around login items.",
        status: "todo",
        priority: "P1",
        area: "platform",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/PROJECT_AUDIT.md"]
      },
      {
        id: "MCC-008",
        title: "Make the quick-launch dock user-configurable",
        notes:
          "The dock is currently hardcoded to Chrome, ChatGPT, and Telegram. Move that list into user-managed configuration.",
        status: "todo",
        priority: "P1",
        area: "product",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../BEHAVIORS.md"]
      },
      {
        id: "MCC-009",
        title: "Improve action failure feedback beyond notifications only",
        notes:
          "Add inline error clarity, last-run status, or lightweight execution history so failures are easier to diagnose.",
        status: "todo",
        priority: "P1",
        area: "product",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/UI_AND_UX_GUIDELINES.md"]
      },
      {
        id: "MCC-010",
        title: "Add a GitHub Actions smoke-build workflow",
        notes:
          "Run `./build.sh` on macOS in CI before adding release automation.",
        status: "todo",
        priority: "P2",
        area: "release",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/RELEASE_AND_DEPLOYMENT.md"]
      },
      {
        id: "MCC-011",
        title: "Package and publish a repeatable release artifact",
        notes:
          "Decide whether the first public release should be a `.zip` or `.dmg`, then document and script the packaging flow.",
        status: "todo",
        priority: "P2",
        area: "release",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/RELEASE_AND_DEPLOYMENT.md"]
      },
      {
        id: "MCC-012",
        title: "Define a trusted-command model for shell actions",
        notes:
          "Document what kinds of shell commands are expected, how users should store scripts, and how to avoid unsafe defaults in a public repo.",
        status: "todo",
        priority: "P2",
        area: "security",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../SECURITY.md", "../docs/ACTION_SYSTEM.md"]
      },
      {
        id: "MCC-013",
        title: "Create screenshots and first-run onboarding docs",
        notes:
          "Capture the app modes and action setup flow so the repo is easier for future collaborators to understand quickly.",
        status: "todo",
        priority: "P2",
        area: "docs",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/PROJECT_OVERVIEW.md"]
      },
      {
        id: "MCC-014",
        title: "Add config schema migration and backup planning",
        notes:
          "Before expanding settings and action metadata, decide how old config files will be migrated safely.",
        status: "todo",
        priority: "P2",
        area: "platform",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["docs/PERSISTENCE_AND_STATE.md"]
      },
      {
        id: "MCC-015",
        title: "Review branding polish for iconography and status-item presentation",
        notes:
          "The app currently uses a text bolt in the menu bar. Consider a stronger asset and consistency pass after core product work stabilizes.",
        status: "todo",
        priority: "P3",
        area: "ui-ux",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/UI_AND_UX_GUIDELINES.md"]
      },
      {
        id: "MCC-016",
        title: "Add basic automated coverage for config normalization and persistence",
        notes:
          "Even lightweight verification around `ConfigManager` would reduce regressions when action metadata grows.",
        status: "todo",
        priority: "P2",
        area: "platform",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: ["../docs/APP_ARCHITECTURE.md"]
      },
      {
        id: "MCC-017",
        title: "Add due date field to tasks",
        notes:
          "The current task model has no deadline concept. A lightweight due date field would help prioritise time-sensitive work without overcomplicating the schema.",
        lane: "newly-added-or-updated",
        priority: "P2",
        area: "product",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: []
      },
      {
        id: "MCC-018",
        title: "Add keyboard shortcuts: N to create, / to search, Esc to close",
        notes:
          "Basic hotkeys make the tracker feel native and reduce friction for power users. N opens the add-task modal, / focuses the search input, Esc dismisses any open modal.",
        lane: "newly-added-or-updated",
        priority: "P2",
        area: "ui-ux",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: []
      },
      {
        id: "MCC-019",
        title: "Shorten export filenames and include date timestamp",
        notes:
          "Current filenames are long and generic. Switching to mcc-tracker-YYYY-MM-DD.json and mcc-tracker-YYYY-MM-DD.md makes exports easier to sort and identify.",
        lane: "newly-added-or-updated",
        priority: "P3",
        area: "ui-ux",
        source: "recommended",
        recommendedBy: "Codex (GPT-5)",
        references: []
      },
      {
        id: "LBM-003",
        title: "Allow the header icon to be customised by the user",
        notes:
          "The icon left of the project title is currently a hardcoded SVG. Let users swap it for an emoji, an uploaded image, or a preset icon — similar to how Notion lets you set a page icon. Store the selection in localStorage alongside the project name.",
        lane: "backlog",
        priority: "P2",
        area: "ui-ux",
        source: "user-requested",
        recommendedBy: "",
        references: []
      },
      {
        id: "LBM-007",
        title: "Add redo functionality (Cmd+Shift+Z)",
        notes: "Follow-on to the undo system. Implement a redo stack that re-applies the last undone action. Undo and redo stacks should stay in sync: redoing after a new action clears the redo stack.",
        lane: "backlog",
        priority: "P2",
        area: "product",
        source: "recommended",
        recommendedBy: "Bappy Golder",
        references: []
      },
      {
        id: "LBM-008",
        title: "Persist undo history across page refresh using sessionStorage",
        notes: "The undo stack currently lives in memory and is lost on reload. Serialise it to sessionStorage so users can undo after an accidental page refresh within the same browser tab session.",
        lane: "backlog",
        priority: "P3",
        area: "platform",
        source: "recommended",
        recommendedBy: "Bappy Golder",
        references: []
      },
      {
        id: "LBM-009",
        title: "Undo drag-and-drop reorders in list and board view",
        notes: "Currently only lane changes via moveTask() are tracked. Drag-to-reorder within the list (manual sort) and board column reordering are not yet undoable. Extend the undo stack to cover these cases.",
        lane: "backlog",
        priority: "P2",
        area: "product",
        source: "recommended",
        recommendedBy: "Bappy Golder",
        references: []
      },
      {
        id: "LBM-010",
        title: "Show a mini undo history pop-up (last 5 actions)",
        notes: "Add a small hoverable history indicator near the undo toast, or inside the settings popover, that lists the last 5 undoable actions by description. Clicking an entry undoes back to that point.",
        lane: "backlog",
        priority: "P3",
        area: "ui-ux",
        source: "recommended",
        recommendedBy: "Bappy Golder",
        references: []
      },
      {
        id: "LBM-001",
        title: "Design the OBM Freemium SaaS Architecture",
        notes: "Brainstorm cloud syncing strategies and gamified business structure for the online-tier SaaS version.",
        lane: "backlog",
        priority: "P3",
        area: "product",
        source: "user-requested",
        recommendedBy: "Vision Roadmap",
        references: ["docs/VISION_AND_PHILOSOPHY.md"]
      },
      {
        id: "LBM-002",
        title: "Draft 'Business in a Box' onboarding questionnaire",
        notes: "Draft the set of questions required from users so the system can dynamically render their business plan and task board.",
        lane: "backlog",
        priority: "P2",
        area: "product",
        source: "user-requested",
        recommendedBy: "Vision Roadmap",
        references: ["docs/VISION_AND_PHILOSOPHY.md"]
      },
      {
        id: "LBM-S001",
        title: "Remove legacy Mac Control Center task references from seed data",
        notes: "Tasks MCC-004 through MCC-016 reference a macOS app (MacControlCenter) that is unrelated to LBM. These should be deleted from the seed data or replaced with LBM-relevant backlog items before public release.",
        lane: "newly-added-or-updated",
        priority: "P1",
        area: "docs",
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        references: ["data/project-data.js"]
      },
      {
        id: "LBM-S002",
        title: "Add screenshots and visual walkthrough to README and docs",
        notes: "There are no screenshots of the running app. Add at least one screenshot of List View, Board View, and the Detail Panel to the README and/or a new docs/SCREENSHOTS.md. This is the most impactful thing for first-time users evaluating the project.",
        lane: "newly-added-or-updated",
        priority: "P1",
        area: "docs",
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        references: ["README.md", "docs/SETUP_GUIDE.md"]
      },
      {
        id: "LBM-S003",
        title: "Cross-browser compatibility testing",
        notes: "Test the full app (List View, Board View, Detail Panel, Docs tab, Resources tab) in Chrome, Firefox, and Safari. Document any inconsistencies. The drag-and-drop system and contenteditable notes editor are the most likely failure points across browsers.",
        lane: "newly-added-or-updated",
        priority: "P1",
        area: "release",
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        references: []
      },
      {
        id: "LBM-S004",
        title: "Verify all internal doc links are correct",
        notes: "The README and several docs reference each other by relative path. After the docs reorganisation, do a link audit: open each linked file from the Docs tab and from the README to confirm nothing is broken.",
        lane: "newly-added-or-updated",
        priority: "P2",
        area: "docs",
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        references: ["README.md", "data/project-data.js"]
      },
      {
        id: "LBM-S005",
        title: "Create CONTRIBUTING.md for open-source handoff",
        notes: "Before making this repo public, write a short CONTRIBUTING.md covering: how to run the app locally, how to add a feature (point to SKILL.md), how to add a keyboard shortcut (point to SKILL_ADD_SHORTCUT.md), how to submit a PR, and code style conventions (vanilla JS, no build step, dark-only CSS).",
        lane: "backlog",
        priority: "P2",
        area: "docs",
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        references: ["SKILL.md", "SKILL_ADD_SHORTCUT.md"]
      },
      {
        id: "LBM-S006",
        title: "Expose window.LBM public API in task-app.js",
        notes: "Add window.LBM = { addTask(), getTasks() } inside the IIFE after init(). addTask() uses normalizeTask() internally and triggers render() + highlightNewRow(). This is the foundation for AI and cross-project task creation.",
        lane: "newly-added-or-updated",
        urgency: 4,
        value: 10000,
        priority: "P1",
        area: "product",
        source: "user-requested",
        recommendedBy: "",
        references: ["task-app.js", "SKILL_ADD_TASK.md"]
      },
      {
        id: "LBM-S007",
        title: "Create SKILL_ADD_TASK.md",
        notes: "Claude-facing skill file that defines trigger phrases (\"Add this to the task board\", etc.) and inference rules for urgency/value/area from natural language. Claude reads this and generates window.LBM.addTask() commands.",
        lane: "newly-added-or-updated",
        urgency: 4,
        value: 10000,
        priority: "P1",
        area: "docs",
        source: "user-requested",
        recommendedBy: "",
        references: ["SKILL_ADD_TASK.md"]
      },
      {
        id: "LBM-S008",
        title: "Create CLAUDE_INTEGRATION_GUIDE.md",
        notes: "Guide for using LBM alongside other development projects. Covers the two-tab workflow, cross-project task logging, and guidance for Claude on when to generate commands vs. modify source files.",
        lane: "newly-added-or-updated",
        urgency: 3,
        value: 5000,
        priority: "P2",
        area: "docs",
        source: "user-requested",
        recommendedBy: "",
        references: ["CLAUDE_INTEGRATION_GUIDE.md"]
      },
      {
        id: "LBM-S009",
        title: "Add voice input (Web Speech API) to task creation modal",
        notes: "Mic button next to the Title field in the New Task modal. Speech fills the title; applyVoiceInference() auto-sets urgency and area based on keyword detection. Three visual states: idle, listening (purple pulse), error (red). Gracefully disabled in Firefox.",
        lane: "newly-added-or-updated",
        urgency: 4,
        value: 10000,
        priority: "P1",
        area: "ui-ux",
        source: "user-requested",
        recommendedBy: "",
        references: ["task-app.js", "index.html", "styles.css", "docs/VOICE_COMMANDS.md"]
      },
      {
        id: "LBM-S010",
        title: "Create docs/AI_TASK_CREATION.md",
        notes: "User-facing documentation for the docs viewer covering both AI task creation methods: Claude Code skill and voice input. Includes window.LBM API reference, field table, inference tables, and 3 example console commands.",
        lane: "newly-added-or-updated",
        urgency: 3,
        value: 5000,
        priority: "P2",
        area: "docs",
        source: "user-requested",
        recommendedBy: "",
        references: ["docs/AI_TASK_CREATION.md"]
      },
      {
        id: "LBM-S011",
        title: "Create docs/VOICE_COMMANDS.md",
        notes: "User-facing voice input guide for the docs viewer. Covers how to use the mic button, browser support matrix, urgency/area keyword tables, and tips.",
        lane: "newly-added-or-updated",
        urgency: 3,
        value: 5000,
        priority: "P2",
        area: "docs",
        source: "user-requested",
        recommendedBy: "",
        references: ["docs/VOICE_COMMANDS.md"]
      },
      {
        id: "LBM-S012",
        title: "Update data/docs-content.js and data/project-data.js with new docs",
        notes: "Add pre-rendered cache entries for AI_TASK_CREATION.md and VOICE_COMMANDS.md to docs-content.js. Add new docs and skills entries to project-data.js. Update cached CLAUDE.md and SKILL.md content to reflect new sections.",
        lane: "newly-added-or-updated",
        urgency: 3,
        value: 5000,
        priority: "P2",
        area: "project-system",
        source: "user-requested",
        recommendedBy: "",
        references: ["data/docs-content.js", "data/project-data.js"]
      },
      {
        id: "LBM-S013",
        title: "Update CLAUDE.md with task creation triggers and file map",
        notes: "Add ADDING TASKS VIA AI section with trigger phrases and API reference. Update file map to include SKILL_ADD_TASK.md, CLAUDE_INTEGRATION_GUIDE.md, and new docs files.",
        lane: "newly-added-or-updated",
        urgency: 3,
        value: 5000,
        priority: "P2",
        area: "docs",
        source: "user-requested",
        recommendedBy: "",
        references: ["CLAUDE.md"]
      }
    ]
  },
  docs: [
    {
      title: "About",
      summary: "What LBM is, who it's for, and the vision behind it.",
      path: "docs/ABOUT.md",
      lastUpdated: "2026-04-03"
    },
    {
      title: "Setup Guide",
      summary: "Open, name your copy, add tasks, done. Advanced configuration for developers below.",
      path: "docs/SETUP_GUIDE.md",
      lastUpdated: "2026-04-04"
    },
    {
      title: "Developer Guide",
      summary: "Portability, embedding in larger projects, build system exclusion, storage key, .gitignore, and the documentation rule.",
      path: "docs/DEVELOPER_GUIDE.md",
      lastUpdated: "2026-03-31"
    },
    {
      title: "AI Development Guide",
      summary: "Working with Claude Code: token conservation, model recommendations, the 5-location shortcut rule, and feedback loops.",
      path: "docs/AI_DEVELOPMENT_GUIDE.md",
      lastUpdated: "2026-04-01"
    },
    {
      title: "Vision and Philosophy",
      summary: "The overarching vision, three-tier rollout strategy (LBM/OBM/Agency), and the AI-in-a-box philosophy.",
      path: "docs/VISION_AND_PHILOSOPHY.md",
      lastUpdated: "2026-03-28"
    },
    {
      title: "Persistence and State",
      summary: "What data lives where: localStorage, seed data, reset behaviour, and how to share changes.",
      path: "docs/PERSISTENCE_AND_STATE.md",
      lastUpdated: "2026-03-30"
    },
    {
      title: "Local Project System",
      summary: "How the local tracker, docs hub, and seed data work together. How to add tasks, docs, and skills.",
      path: "docs/LOCAL_PROJECT_SYSTEM.md",
      lastUpdated: "2026-03-30"
    },
    {
      title: "Keyboard Shortcuts",
      summary: "All keyboard shortcuts across the app: navigation, new items, search, detail panel, and board view.",
      path: "docs/KEYBOARD_SHORTCUTS.md",
      lastUpdated: "2026-04-01"
    },
    {
      title: "Phase Handover Plan",
      summary: "Phased build plan with copy-paste prompts for each context window.",
      path: "PHASES.md",
      lastUpdated: "2026-03-28"
    },
    {
      title: "AI Task Creation",
      summary: "How to add tasks via Claude Code or the browser console API. Trigger phrases, urgency/value/area inference, field reference, and example console commands.",
      path: "docs/AI_TASK_CREATION.md",
      lastUpdated: "2026-03-29"
    },
    {
      title: "Voice Commands",
      summary: "How to use the microphone button in the task creation form. Browser support, urgency/area keyword tables, and tips.",
      path: "docs/VOICE_COMMANDS.md",
      lastUpdated: "2026-03-29"
    },
    {
      title: "About Skills",
      summary: "What skills are, how they differ from docs, and a guide to every skill in this project. For anyone working with Claude Code.",
      path: "docs/ABOUT_SKILLS.md",
      lastUpdated: "2026-04-01"
    },
    {
      title: "Link Management",
      summary: "How internal doc links must be written. The docs.html?doc= format, URL routing, and the rule for Claude and AI developers.",
      path: "docs/LINK_MANAGEMENT.md",
      lastUpdated: "2026-04-01"
    },
    {
      title: "Product Roadmap",
      summary: "Free vs paid strategy, GitHub repo structure, backend plan, tech stack, monetization tiers, the privatization plan, and open decisions log.",
      path: "docs/INTERNAL_ROADMAP.md",
      lastUpdated: "2026-04-03"
    }
  ],
  skills: [
    {
      title: "LBM Development Guide",
      summary: "How to add features, update styles, and extend the task tracker.",
      path: "SKILL.md",
      lastUpdated: "2026-04-03"
    },
    {
      title: "Add a Keyboard Shortcut",
      summary: "Step-by-step process for adding any keyboard shortcut to LBM — covers all 5 locations that must be updated.",
      path: "SKILL_ADD_SHORTCUT.md",
      lastUpdated: "2026-04-01"
    },
    {
      title: "Front-End Design Skill",
      summary: "Design reference for all CSS and UI work: type scale, spacing grid, color system, component patterns, motion rules, and accessibility — drawn from Linear, shadcn/ui, Material Design 3, and Apple HIG.",
      path: "DESIGN_SKILL.md",
      lastUpdated: "2026-03-31"
    },
    {
      title: "Add a Task via Claude",
      summary: "Skill for creating LBM tasks from natural language during any Claude Code session. Covers trigger phrases, urgency/value/area inference rules, and the window.LBM.addTask() console command pattern.",
      path: "SKILL_ADD_TASK.md",
      lastUpdated: "2026-03-30"
    },
    {
      title: "Claude Integration Guide",
      summary: "How to use LBM alongside other development projects. Two-tab workflow, cross-project task logging via the console API, and rules for Claude when operating in a non-LBM session.",
      path: "CLAUDE_INTEGRATION_GUIDE.md",
      lastUpdated: "2026-03-31"
    }
  ],
  roadmaps: [
    {
      title: "About This Roadmap",
      summary: "Why the roadmap is public, our build-in-the-open philosophy, and how to collaborate.",
      path: "docs/ROADMAP_ABOUT.md",
      lastUpdated: "2026-04-01"
    },
    {
      title: "Product Roadmap",
      summary: "The three-tier product vision (Free / Pro / Business in a Box), technology principles, planned features, and open decisions.",
      path: "docs/ROADMAP_PRODUCT.md",
      lastUpdated: "2026-04-01"
    },
    {
      title: "Shortcut Management System",
      summary: "Full feature specification: conflict-aware keyboard shortcut customisation across every action in LBM.",
      path: "docs/ROADMAP_SHORTCUTS.md",
      lastUpdated: "2026-03-29"
    },
    {
      title: "Documentation UX Improvements",
      summary: "Planned pass on setup guide structure, non-developer path ordering, About ↔ Setup Guide cross-linking, and docs front-end polish.",
      path: "docs/ROADMAP_DOCS_UX.md",
      lastUpdated: "2026-04-03"
    }
  ]
};
