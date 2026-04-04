# About Local Business Manager

**Local Business Manager (LBM)** is a free, open-source task and project tracker that runs entirely in your web browser — no sign-up, no subscription, no internet connection required.

You download it once, open a file, and it works. Your data stays on your computer.

> **Ready to get started?** [Setup Guide →](docs.html?doc=docs/SETUP_GUIDE.md) gets you up and running in under two minutes.

---

## What It Does

LBM gives you a clean, fast way to manage tasks and projects:

- **List View** — see all your tasks in a sortable table, filter by area, search by keyword
- **Board View** — a Kanban-style drag-and-drop board with columns for each stage of your work
- **Task Detail Panel** — click any task to open a side panel with notes, priority, status, and rich-text editing
- **Docs Hub** — a built-in documentation viewer so your team guides and references live right alongside your tasks
- **Resources Tab** — a place to keep links, assets, and reference material

Everything is instant. No loading spinners, no server round-trips.

---

## How It Feels to Use

Speed and feel are treated as first-class features — not afterthoughts.

**Instant response.** Every click, keystroke, and drag responds immediately. There are no network calls, no loading states, nothing standing between you and your work.

**Nothing ever disappears unexpectedly.** Every destructive action — deleting a task, moving it to a new lane, resetting to seed data — shows an undo banner. You have a safety net without being slowed down by confirmation dialogs on every action.

**Typing in flow.** The inline add form is designed for rapid entry. Press Enter to save a task and immediately start typing the next one. If a newly added task moves elsewhere in the list (filtered by area, sorted by urgency), the view briefly scrolls to show you where it landed — then smoothly returns to the form so you never lose your place.

**Everything stays where you left it.** Collapsed columns, sort order, visible properties, property labels you've renamed — all of it is remembered across sessions. Open the app tomorrow and it looks exactly how you left it.

**Calm, not cluttered.** The interface surfaces only what you need for the current action. Filters, sort options, and settings live in a small toolbar. They slide out when you need them and disappear when you don't.

---

## Who It Is For

LBM is designed for:

- **Solo creators and freelancers** who want a clean project tracker without paying for Notion or Asana
- **Small teams** who want to share a project setup without setting up a database or account system
- **Developers** who want a self-contained, version-controlled task system that lives inside their project folder
- **Anyone** who wants full ownership of their data and hates sign-up forms

---

## Why We Built It

Most task tools make you dependent on their servers. If they go down, change pricing, or shut down — your work is at risk.

LBM is different:

- **Your data lives on your computer** — in your browser's local storage, synced to a file you control
- **No account required** — open the file and start working
- **No internet required** — works offline, always
- **Free forever** — no trial, no paywall, no upsell

---

## How It Fits Into the Bigger Picture

LBM is the foundation of a three-part vision:

| Tier | Product | Who It's For |
|---|---|---|
| 1 | **LBM** — Local Business Manager (this project) | Developers, solo creators — free and open source |
| 2 | **OBM** — Online Business Manager *(planned)* | Entrepreneurs and startups — hosted, cloud-synced |
| 3 | **Business in a Box** *(planned)* | Corporations and scaling teams — full agency rollout |

The idea: instead of buying separate tools, coaches, and courses, you get everything packaged together — the tool, the framework, and the guidance built in.

---

## Use It Anywhere — Drop, Name, Go

LBM is a folder. That is all it is.

Copy it into any project. Open `data/project-data.js`, set your project name and areas, then click **Reset to Seed** from the ⓘ info panel. In under two minutes you have a fully configured task tracker that belongs to your project — version-controlled, shareable, and completely self-contained.

There is no account to create, no API key to configure, and no cloud service to connect. The same folder works on every computer, in every browser, offline and online.

---

## Technical Overview

For those who are curious:

- **Pure HTML, CSS, and JavaScript** — no frameworks, no build tools, no npm
- **Local-first** — task data is stored in your browser's `localStorage`
- **Seed data** — a `project-data.js` file sets the default tasks and configuration that any new user sees
- **Portable** — the entire app is a folder of files you can zip, share, or drop into any project

---

## Version

This is **LBM v1** — a stable, self-contained release with full documentation included.

**Created by:** Bappy Golder  
**License:** Open Source  
**GitHub:** [View the project on GitHub](https://github.com)

---

## Getting Started

New here? The [Setup Guide](docs.html?doc=docs/SETUP_GUIDE.md) has everything you need — including a non-technical installation path that takes less than two minutes.
