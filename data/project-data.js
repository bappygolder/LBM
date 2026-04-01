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
      }
    ]
  },
  docs: [
    {
      title: "Vision and Philosophy",
      summary: "The overarching vision, three-tier rollout strategy (LBM/OBM/Agency), and the AI-in-a-box philosophy.",
      path: "docs/VISION_AND_PHILOSOPHY.md"
    },
    {
      title: "Persistence and State",
      summary: "What data lives where: localStorage, seed data, and sync behaviour.",
      path: "docs/PERSISTENCE_AND_STATE.md"
    },
    {
      title: "Local Project System",
      summary: "How the local tracker, docs hub, and online sync habit should work together.",
      path: "docs/LOCAL_PROJECT_SYSTEM.md"
    },
    {
      title: "LBM Development Guide",
      summary: "How to add features, update styles, and extend the task tracker.",
      path: "SKILL.md"
    },
    {
      title: "Phase Handover Plan",
      summary: "Phased build plan with copy-paste prompts for each context window.",
      path: "PHASES.md"
    }
  ],
  skills: []
};
