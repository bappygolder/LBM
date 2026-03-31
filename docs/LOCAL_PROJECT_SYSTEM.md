# Local Project System

## Goal

Keep project management and documentation close to the codebase so AI agents and humans can update them in the same workspace.

## Components

### `TaskTracker/index.html`

Local-first task board for backlog review, quick edits, export, and manual prioritization.

### `TaskTracker/docs.html`

Project docs hub linking the markdown docs and the repo-local skill files.

### `TaskTracker/project-data.js`

Repo-owned seed data for:

- project metadata
- seeded backlog items
- docs index
- skill index

### `docs/`

Markdown source of truth for architecture, persistence, release, and workflow guidance.

## How To Add Tasks

### For durable, repo-owned tasks

Add them to `TaskTracker/project-data.js` and commit the change.

### For personal working notes

Add them inside the browser tracker UI. They will be stored in `localStorage` on that machine.

## AI-Recommended Tasks

When an AI assistant adds a suggested task to the repo-owned backlog, mark it with:

- `source: recommended`
- `recommendedBy: Codex (GPT-5)`

This keeps human-requested work distinct from audit or AI-suggested work.

## Online Sync Model

The local tracker should be treated as the fast workspace, not an automatic sync engine. For now:

1. Update repo-owned backlog items here.
2. Export JSON or Markdown from the tracker.
3. Mirror the relevant items into the online tracker manually.

If online sync becomes important, add a small sync script against the chosen service rather than trying to make static HTML write directly to repo files.
