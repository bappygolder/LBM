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
    seedVersion: "2026-04-06-sync",
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
        id: "LBM-003",
        title: "Allow the header icon to be customised by the user",
        notes: "The icon left of the project title is currently a hardcoded SVG. Let users swap it for an emoji, an uploaded image, or a preset icon — similar to how Notion lets you set a page icon. Store the selection in localStorage alongside the project name.",
        lane: "backlog",
        priority: "P2",
        area: "ui-ux",
        effort: 4,
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
        effort: 5,
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
        effort: 3,
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
        effort: 7,
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
        effort: 5,
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
        effort: 8,
        source: "user-requested",
        recommendedBy: "Vision Roadmap",
        references: [
          "docs/VISION_AND_PHILOSOPHY.md"
        ]
      },
      {
        id: "LBM-002",
        title: "Draft 'Business in a Box' onboarding questionnaire",
        notes: "Draft the set of questions required from users so the system can dynamically render their business plan and task board.",
        lane: "backlog",
        priority: "P2",
        area: "product",
        effort: 6,
        source: "user-requested",
        recommendedBy: "Vision Roadmap",
        references: [
          "docs/VISION_AND_PHILOSOPHY.md"
        ]
      },
      {
        id: "LBM-S001",
        title: "Remove legacy Mac Control Center task references from seed data",
        notes: "Tasks MCC-004 through MCC-016 reference a macOS app (MacControlCenter) that is unrelated to LBM. These should be deleted from the seed data or replaced with LBM-relevant backlog items before public release. Quick win — unblocks public GitHub release.",
        lane: "newly-added-or-updated",
        priority: "P1",
        area: "docs",
        effort: 1,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "data/project-data.js"
        ]
      },
      {
        id: "LBM-S002",
        title: "Add screenshots and visual walkthrough to README and docs",
        notes: "There are no screenshots of the running app. Add at least one screenshot of List View, Board View, and the Detail Panel to the README and/or a new docs/SCREENSHOTS.md. This is the most impactful thing for first-time users evaluating the project.",
        lane: "newly-added-or-updated",
        priority: "P1",
        area: "docs",
        effort: 7,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "README.md",
          "docs/SETUP_GUIDE.md"
        ]
      },
      {
        id: "LBM-S003",
        title: "Cross-browser compatibility testing",
        notes: "Test the full app (List View, Board View, Detail Panel, Docs tab, Resources tab) in Chrome, Firefox, and Safari. Document any inconsistencies. The drag-and-drop system and contenteditable notes editor are the most likely failure points across browsers.",
        lane: "newly-added-or-updated",
        priority: "P1",
        area: "release",
        effort: 8,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: []
      },
      {
        id: "LBM-S004",
        title: "Verify all internal doc links are correct",
        notes: "The README and several docs reference each other by relative path. After the docs reorganisation, do a link audit: open each linked file from the Docs tab and from the README to confirm nothing is broken.",
        lane: "newly-added-or-updated",
        priority: "P2",
        area: "docs",
        effort: 2,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "README.md",
          "data/project-data.js"
        ]
      },
      {
        id: "LBM-S005",
        title: "Create CONTRIBUTING.md for open-source handoff",
        notes: "Before making this repo public, write a short CONTRIBUTING.md covering: how to run the app locally, how to add a feature (point to SKILL.md), how to add a keyboard shortcut (point to SKILL_ADD_SHORTCUT.md), how to submit a PR, and code style conventions (vanilla JS, no build step, dark-only CSS).",
        lane: "backlog",
        priority: "P2",
        area: "docs",
        effort: 2,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "SKILL.md",
          "SKILL_ADD_SHORTCUT.md"
        ]
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
        effort: 3,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "task-app.js",
          "SKILL_ADD_TASK.md"
        ]
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
        effort: 2,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "SKILL_ADD_TASK.md"
        ]
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
        effort: 2,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "CLAUDE_INTEGRATION_GUIDE.md"
        ]
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
        effort: 8,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "task-app.js",
          "index.html",
          "styles.css",
          "docs/VOICE_COMMANDS.md"
        ]
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
        effort: 2,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "docs/AI_TASK_CREATION.md"
        ]
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
        effort: 2,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "docs/VOICE_COMMANDS.md"
        ]
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
        effort: 3,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "data/docs-content.js",
          "data/project-data.js"
        ]
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
        effort: 1,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "CLAUDE.md"
        ]
      },
      {
        id: "LBM-R001",
        title: "Shortcut Management System — Phase 1: Registry + Settings UI",
        notes: "Central shortcut registry in localStorage, Settings UI panel to view/edit/reset any shortcut, live key combo recorder, and internal conflict detection. Full spec in docs/ROADMAP_SHORTCUTS.md. Not on the immediate revenue path — deprioritised until public launch milestones are hit.",
        lane: "backlog",
        urgency: 2,
        value: 25000,
        priority: "P3",
        area: "product",
        effort: 9,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/ROADMAP_SHORTCUTS.md",
          "SKILL_ADD_SHORTCUT.md"
        ]
      },
      {
        id: "LBM-R002",
        title: "Add due date field with overdue visual indicator",
        notes: "Single date field on the task model. Filter bar option for 'overdue'. Visual badge on task card and list row when past due. Keep it lightweight — plain date input is fine, no calendar picker needed. Planned feature from the product roadmap.",
        lane: "backlog",
        urgency: 3,
        value: 10000,
        priority: "P2",
        area: "product",
        effort: 4,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/ROADMAP_PRODUCT.md"
        ]
      },
      {
        id: "LBM-R003",
        title: "Set up public GitHub repo (lbm-free) and push v1",
        notes: "Create the lbm-free public GitHub repo with MIT license. Clean .gitignore to exclude the private/ folder. Push current main branch. This is Phase 1 of the monetisation launch sequence — the waitlist CTA makes no sense until the repo is public.",
        lane: "backlog",
        urgency: 4,
        value: 10000,
        priority: "P1",
        area: "release",
        effort: 2,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/INTERNAL_ROADMAP.md"
        ]
      },
      {
        id: "LBM-R004",
        title: "Add 'LBM Cloud — coming soon' waitlist CTA in app",
        notes: "Subtle CTA in the app footer or ⓘ info panel. Links to a Typeform or Google Form waitlist. Goal: 50+ signups to validate demand before building cloud features. Do not build Tier 2 without this signal first. Planned in the monetisation roadmap.",
        lane: "backlog",
        urgency: 3,
        value: 10000,
        priority: "P2",
        area: "product",
        effort: 2,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/INTERNAL_ROADMAP.md",
          "docs/ROADMAP_PRODUCT.md"
        ]
      },
      {
        id: "LBM-R005",
        title: "Design and implement Supabase auth + task sync (Pro tier)",
        notes: "Replace localStorage read/write with Supabase API calls. Add user_id and workspace_id to the task model. Use Supabase Auth for login/signup. The data shape is identical — only the persistence layer changes. Stage 1 of the Tier 2 backend plan. IMPORTANT: Requires LBM-R006 product decisions to be locked first — do not start until persona, pricing, and branding are agreed.",
        lane: "backlog",
        urgency: 2,
        value: 25000,
        priority: "P2",
        area: "platform",
        effort: 10,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/INTERNAL_ROADMAP.md"
        ]
      },
      {
        id: "LBM-R006",
        title: "Resolve open product questions before Tier 2 build starts",
        notes: "Four decisions must be locked before Pro development begins: (1) Paying user persona — solopreneur, small team, or agency? (2) Licence — MIT or AGPL for lbm-free? (3) Pricing model — subscription ($7–9/mo) or one-time ($49)? (4) Branding — keep 'LBM' or rename Pro to 'OBM'? This unblocks LBM-R005.",
        lane: "backlog",
        urgency: 3,
        value: 5000,
        priority: "P2",
        area: "product",
        effort: 3,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/INTERNAL_ROADMAP.md",
          "docs/ROADMAP_PRODUCT.md"
        ]
      },
      {
        id: "LBM-R007",
        title: "Implement Stripe billing for Solo Pro tier ($7–9/month)",
        notes: "Stripe Checkout + Billing Portal integration in lbm-pro. Solo Pro only at launch — no team tier yet. Keep it simple: one product, one price, one plan. Gate Pro features behind auth middleware. Only start after Supabase auth is working (LBM-R005).",
        lane: "backlog",
        urgency: 2,
        value: 25000,
        priority: "P3",
        area: "platform",
        effort: 10,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/INTERNAL_ROADMAP.md"
        ]
      },
      {
        id: "LBM-C001",
        title: "Build task search with keyboard-first filtering",
        notes: "The current search filters visually but has no keyboard shortcut to focus it. Add / to jump to search, Escape to clear, and highlight matched text within task titles. This is a high-frequency interaction for power users and pays off fast.",
        lane: "newly-added-or-updated",
        urgency: 4,
        value: 10000,
        priority: "P1",
        area: "ui-ux",
        effort: 4,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/KEYBOARD_SHORTCUTS.md"
        ]
      },
      {
        id: "LBM-C002",
        title: "Add task activity log (who changed what and when)",
        notes: "Every task edit currently overwrites lastModified with no history. Add a lightweight change log per task — stored in task.history as an array of {date, field, from, to} entries. Visible in the detail panel. Foundation for the Pro activity feed.",
        lane: "newly-added-or-updated",
        urgency: 3,
        value: 10000,
        priority: "P2",
        area: "product",
        effort: 6,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "docs/PERSISTENCE_AND_STATE.md"
        ]
      },
      {
        id: "LBM-C003",
        title: "Add bulk lane-move action for multi-selected tasks",
        notes: "Multi-select already works in list view. Extend it with a 'Move to lane' bulk action in the selection toolbar. A small dropdown lets you pick any active lane and moves all selected tasks at once. One undo entry covers the whole batch.",
        lane: "newly-added-or-updated",
        urgency: 3,
        value: 10000,
        priority: "P2",
        area: "product",
        effort: 6,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: []
      },
      {
        id: "LBM-C004",
        title: "Remove legacy MCC seed tasks before public GitHub release",
        notes: "Tasks MCC-001 through MCC-016 reference a macOS app (MacControlCenter) unrelated to LBM. Strip these from the seed data and replace with LBM-relevant examples. Quick win — unblocks the public release and cleans up the codebase fast. Must be done before the repo goes public.",
        lane: "newly-added-or-updated",
        urgency: 4,
        value: 5000,
        priority: "P1",
        area: "release",
        effort: 1,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "data/project-data.js",
          "data/tasks.json"
        ]
      },
      {
        id: "LBM-C005",
        title: "Add mobile-responsive layout for list and board views",
        notes: "The app is currently desktop-only. A responsive pass — collapsing the detail panel on small screens, stacking board columns vertically on mobile, and making the toolbar overflow gracefully — would open LBM to tablet and phone use without a native app.",
        lane: "backlog",
        urgency: 2,
        value: 10000,
        priority: "P3",
        area: "ui-ux",
        effort: 8,
        source: "recommended",
        recommendedBy: "Claude Sonnet 4.6",
        tags: [
          "ai"
        ],
        references: [
          "styles.css"
        ]
      },
      {
        id: "LBM-C006",
        title: "AI instruction chat section in list view",
        notes: "Add a dedicated AI chat/instruction panel to the list view. Users can type natural-language commands to Claude to create, update, or move tasks without leaving the app. Future feature — design TBD. High value for power users and a key differentiator for the Pro tier.",
        lane: "backlog",
        urgency: 2,
        value: 15000,
        priority: "P2",
        area: "ui-ux",
        effort: 9,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: []
      },
      {
        id: "LBM-011",
        title: "Jack",
        notes: "Test task — maximum urgency and dollar value",
        lane: "newly-added-or-updated",
        urgency: 5,
        value: 25000,
        area: "project-system",
        effort: 5,
        source: "user-requested",
        recommendedBy: "",
        addedBy: "claude-sonnet-4-6",
        tags: [
          "dev",
          "ai"
        ],
        references: [],
        description: "## What to do\nThis is a test task named Jack. No action required — created to verify task creation flow with urgency 5 and value $25,000.\n\n## Why it matters\nValidates that the file-based task creation pipeline works correctly end to end, including sync script and browser reload.\n\n## Why it's valuable\nConfirms the $25,000 revenue tier is selectable and displays correctly in the UI. Serves as a reference example for the maximum urgency and value combination.\n\n## Why it's urgent\nTest task — added at maximum urgency to verify urgency-5 rendering and priority logic. No real time pressure."
      },
      {
        id: "LBM-C007",
        title: "Add 'effort' field (1–10) to task model and UI",
        notes: "Add an effort property to the task data model (1–10 numeric, similar to urgency). Expose it in: normalizeTask() default, New Task modal select, inline list row editor, board card, detail panel, sort options, and markdown export. Effort represents implementation complexity; complements urgency (time pressure) and value (business impact).",
        lane: "newly-added-or-updated",
        urgency: 3,
        value: 5000,
        priority: "P2",
        area: "product",
        effort: 5,
        source: "user-requested",
        recommendedBy: "",
        tags: [
          "ai"
        ],
        references: [
          "task-app.js",
          "index.html",
          "styles.css"
        ]
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
      title: "Task Creation Guide",
      summary: "How to write high-quality tasks — the 4-section description format (What/Why it matters/Why valuable/Why urgent), revenue-tier tagging, urgency scale, and all four methods for adding tasks.",
      path: "docs/TASK_CREATION_GUIDE.md",
      lastUpdated: "2026-04-05"
    },
    {
      title: "AI Task Creation",
      summary: "How to add tasks via Claude Code or the browser console API. Trigger phrases, urgency/value/area/tags inference, full field reference, and example console commands.",
      path: "docs/AI_TASK_CREATION.md",
      lastUpdated: "2026-04-05"
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
      title: "File Sync System",
      summary: "How tasks.json and the sync script work. The two ways tasks are added (browser UI vs Claude Code), how localStorage and seed data coexist, and the full tasks.json field reference.",
      path: "docs/FILE_SYNC.md",
      lastUpdated: "2026-04-05"
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
      summary: "Three-tier product vision, technology principles, planned features, repo strategy, backend plan, tech stack, monetization tiers, privatization plan, and decisions log.",
      path: "docs/ROADMAP_PRODUCT.md",
      lastUpdated: "2026-04-05"
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
