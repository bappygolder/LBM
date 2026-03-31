# Local Business Manager (LBM)

**LBM** is a lightweight, self-contained, vanilla Javascript Task and Business Manager designed for developers and creators. It acts as a local-first alternative to Notion that requires absolutely no installation, backend, or build step. You can drop this entire folder right into your Git repository, and it just works out-of-the-box.

---

## 🌟 The Vision & The Philosophy

As Artificial Intelligence matures, the way we consume business tools and services is changing.

> *"With AI, we don't just buy coaches or tools separately; we buy everything in a box."*

This repository is the foundational component of a three-tier vision bridging open-source developers with fully productized business coaching and implementation.

### 1. The Open Source Tier: LBM (Local Business Manager)
This repository! It is a free, vanilla, local-first web app that developers can drop into any project. It stores data locally in your browser (`localStorage`) and allows you to track project phases, docs, and tasks without the bloat of external dependencies or SaaS subscriptions.

### 2. The Online Tier: OBM (Online Business Manager)
A freemium SaaS model taking the foundation of LBM to the cloud. Designed to automate and gamify the structure of a business. Instead of starting from a blank page like Notion, OBM builds your custom dashboard, structure, and task board based on an interactive onboarding process.

### 3. The Enterprise Tier: "Business in a Box"
A fully conceptualized coaching and implementation product. Clients purchase a module combining our proprietary content, training videos, standard operating procedures, and the OBM software itself. The tool structurizes their team communication, CEO systemization, and overall business processes, growing alongside their company's progression.

For a deeper dive into this ethos, read the complete [Vision and Philosophy Documentation.](docs/VISION_AND_PHILOSOPHY.md)

---

## 🚀 Quick Start

Because this app uses zero build-steps, you can use it immediately.

1. **Clone or copy this folder** into your own local project repository.
2. **Open `index.html`** in any modern web browser.
3. Start managing your tasks! All state is saved directly to your browser's local storage.

### Customization
- Open **`data/project-data.js`** to change the project name, define your specific working areas, and adjust the initial "seed tasks".
- Read **`SKILL.md`** and **`CLAUDE.md`** for insights on extending the UI using AI or making code-level customizations.
- Review the **[Docs](docs.html)** tab inside the app for more extensive guides on Persistence, State, and the Project System framework.
