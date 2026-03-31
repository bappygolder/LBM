# Persistence and State

This project has three different persistence layers, and they behave differently.

## 1. App Configuration

### Stored In

- `~/Library/Application Support/MacControlCenter/config.json`

### Contains

- Action names
- Shortcut keys
- Action types
- Action targets

### Sync Behavior

- Local to the current macOS user account
- Not committed to the repo
- Not automatically shared across machines

## 2. App Preferences

### Stored In

- macOS `UserDefaults`

### Contains

- view mode
- always-on-top state
- show-on-all-desktops state
- opacity
- launch-at-login preference

### Sync Behavior

- Local to the current machine/user
- Not visible in git
- Not automatically shared unless the OS syncs preferences externally

## 3. Local Business Manager State

### Stored In

- Repo seed data in `TaskTracker/project-data.js`
- Browser-local working state in `localStorage`

### Contains

- Seed backlog and docs metadata from the repo
- Personal edits made in the browser after loading the tracker

### Sync Behavior

- Repo seed data syncs through git when committed
- Browser edits do not update the repo automatically
- Browser edits do not update an online tracker automatically
- To share tracker changes, export them and then copy them into the online system or commit them back into repo-managed seed data

## Practical Answer

If you add a new item in the local tracker UI, it will persist in that browser on that machine, but it will not automatically update "across the board." Cross-device or online sync needs an explicit export/import or a dedicated sync integration.

## Recommended Source of Truth

Use this split:

- Repo files for durable baseline tasks, docs, and audit-driven backlog
- Browser local state for fast personal working changes
- Online tracker for broader team visibility only after export or manual sync
