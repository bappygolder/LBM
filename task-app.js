/* ──────────────────────────────────────────────────────────────────────────────
   LTM — Local Task Manager · task-app.js
   Vanilla JS, no build step.

   NOTE on the notes editor: uses contenteditable with basic formatting support.
   It is designed to be replaced with BlockNote (React) in a future migration.
   The getEditorContent() / setEditorContent() helpers make the swap clean.
────────────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const data    = window.MCCProjectData;
  const tracker = data.tracker;
  const STORAGE_KEY = tracker.storageKey;

  /* ── Lane / column definitions ─────────────────────────────────────────────── */

  const ALL_LANES    = ["newly-added-or-updated", "backlog", "processing", "on-hold", "in-progress", "completed", "archived"];
  const ACTIVE_LANES = ["newly-added-or-updated", "backlog", "processing", "on-hold", "in-progress"];
  const DONE_LANES   = ["completed", "archived"];

  const LANE_LABELS = {
    "newly-added-or-updated": "Newly Added",
    "backlog":                "Backlog",
    "processing":             "Processing",
    "on-hold":                "On Hold",
    "in-progress":            "In Progress",
    "completed":              "Completed",
    "archived":               "Archived"
  };

  // Board column definitions. Key = unique column id.
  // lanes = which lane values map to this column.
  const DEFAULT_BOARD_COLUMNS = [
    { key: "newly-added-or-updated", label: "Newly Added or Updated",  lanes: ["newly-added-or-updated"], dropLane: "newly-added-or-updated" },
    { key: "backlog",                label: "Backlog",                 lanes: ["backlog"],                dropLane: "backlog"                },
    { key: "processing-on-hold",     label: "Processing / On Hold",    lanes: ["processing", "on-hold"],  dropLane: "processing"             },
    { key: "in-progress",            label: "In Progress",             lanes: ["in-progress"],            dropLane: "in-progress"            },
    { key: "completed",              label: "Completed",               lanes: ["completed"],              dropLane: "completed"              },
    { key: "archive",                label: "Archive",                 lanes: ["archived"],               dropLane: "archived"               }
  ];

  const PRIORITY_TO_URGENCY = { P0: 5, P1: 4, P2: 3, P3: 2 };
  const PRIORITY_TO_VALUE   = { P0: 25000, P1: 10000, P2: 5000, P3: 1000 };

  /* ── Application state ─────────────────────────────────────────────────────── */

  let tasks          = [];
  let boardColumns   = [];  // [{ key, label, lanes, dropLane }] — user-customisable
  let collapsedCols  = []; // [colKey, ...] — collapsed in board view
  let activeView     = "list";
  let hiddenExpanded = false;
  let searchOpen     = false;
  let filterOpen     = false;

  let editingId         = null; // task being edited in the modal
  let detailTaskId      = null; // task shown in detail panel
  let activeColMenuKey  = null; // column key for the open 3-dot menu
  let renamingColKey    = null; // column key being renamed
  let dragTaskId        = null;
  let colDragKey        = null; // column key being dragged for reorder
  let colDropInsertIdx  = null; // insertion index during column drag (0 = before first)

  // Detail panel view mode: "side" | "center" | "full"
  let detailMode = "side";

  // List view sort: "urgency" | "value" | "modified"
  let listSort = "urgency";

  // Which properties to show on board cards
  const DEFAULT_CARD_PROPS = { urgency: true, notes: true, value: false, area: false };
  let cardVisibleProps = { ...DEFAULT_CARD_PROPS };

  // Property display order and custom labels
  const DEFAULT_PROP_ORDER  = ["stage", "urgency", "value", "area", "modified"];
  const DEFAULT_PROP_LABELS = { stage: "Stage", urgency: "Urgency", value: "Value", area: "Area", modified: "Modified" };
  let detailPropOrder  = [...DEFAULT_PROP_ORDER];
  let propLabels       = { ...DEFAULT_PROP_LABELS };
  let propDragSrcIdx   = null; // index of property row being dragged
  let propsCollapsed   = false; // whether the properties section is collapsed

  /* ── Element references ────────────────────────────────────────────────────── */

  const el = {
    brandName:          document.getElementById("brandName"),
    toggleInfoButton:   document.getElementById("toggleInfoButton"),
    infoDrawer:         document.getElementById("infoDrawer"),
    statsGrid:          document.getElementById("statsGrid"),
    storageStatus:      document.getElementById("storageStatus"),
    exportJsonButton:   document.getElementById("exportJsonButton"),
    exportMarkdownButton: document.getElementById("exportMarkdownButton"),
    resetButton:        document.getElementById("resetButton"),
    seedNotice:         document.getElementById("seedNotice"),

    listViewButton:     document.getElementById("listViewButton"),
    boardViewButton:    document.getElementById("boardViewButton"),
    listView:           document.getElementById("listView"),
    boardView:          document.getElementById("boardView"),

    searchToggle:       document.getElementById("searchToggle"),
    filterToggle:       document.getElementById("filterToggle"),
    searchFilterBar:    document.getElementById("searchFilterBar"),
    searchInput:        document.getElementById("searchInput"),
    filterSelect:       document.getElementById("filterSelect"),
    filterSummary:      document.getElementById("filterSummary"),
    openCreateButton:   document.getElementById("openCreateButton"),

    taskList:           document.getElementById("taskList"),
    hiddenListsWrap:    document.getElementById("hiddenListsWrap"),
    hiddenListsToggle:  document.getElementById("hiddenListsToggle"),
    hiddenListsCount:   document.getElementById("hiddenListsCount"),
    hiddenLists:        document.getElementById("hiddenLists"),

    boardColumns:       document.getElementById("boardColumns"),
    boardCollapsedStrip: document.getElementById("boardCollapsedStrip"),
    boardHiddenChips:   document.getElementById("boardHiddenChips"),

    // Detail panel
    detailOverlay:      document.getElementById("detailOverlay"),
    detailBackdrop:     document.getElementById("detailBackdrop"),
    detailPanel:        document.getElementById("detailPanel"),
    detailCloseBtn:     document.getElementById("detailCloseBtn"),
    detailMarkDoneBtn:  document.getElementById("detailMarkDoneBtn"),
    detailDeleteBtn:    document.getElementById("detailDeleteBtn"),
    detailTitle:        document.getElementById("detailTitle"),
    detailPropsSection: document.querySelector(".detail-props-section"),
    detailPropsHeader:  document.getElementById("detailPropsHeader"),
    detailPropsChevron: document.getElementById("detailPropsChevron"),
    detailProps:        document.getElementById("detailProps"),
    notesEditor:        document.getElementById("notesEditor"),
    detailModeSide:     document.getElementById("detailModeSide"),
    detailModeCenter:   document.getElementById("detailModeCenter"),
    detailModeFull:     document.getElementById("detailModeFull"),

    // Card fields popover
    cardFieldsBtn:      document.getElementById("cardFieldsBtn"),
    cardFieldsPopover:  document.getElementById("cardFieldsPopover"),
    cfUrgency:          document.getElementById("cfUrgency"),
    cfNotes:            document.getElementById("cfNotes"),
    cfValue:            document.getElementById("cfValue"),
    cfArea:             document.getElementById("cfArea"),

    // Column menu
    colMenu:            document.getElementById("colMenu"),
    colMenuRename:      document.getElementById("colMenuRename"),
    colMenuMoveLeft:    document.getElementById("colMenuMoveLeft"),
    colMenuMoveRight:   document.getElementById("colMenuMoveRight"),
    colMenuHide:        document.getElementById("colMenuHide"),
    colMenuSwatches:    document.getElementById("colMenuSwatches"),
    colMenuDelete:      document.getElementById("colMenuDelete"),

    // Rename modal
    renameModal:        document.getElementById("renameModal"),
    renameModalClose:   document.getElementById("renameModalClose"),
    renameInput:        document.getElementById("renameInput"),
    renameConfirm:      document.getElementById("renameConfirm"),
    renameCancel:       document.getElementById("renameCancel"),

    // Add column modal
    addColModal:        document.getElementById("addColModal"),
    addColModalClose:   document.getElementById("addColModalClose"),
    addColInput:        document.getElementById("addColInput"),
    addColConfirm:      document.getElementById("addColConfirm"),
    addColCancel:       document.getElementById("addColCancel"),

    // Task modal
    taskModal:          document.getElementById("taskModal"),
    modalTitle:         document.getElementById("modalTitle"),
    closeModalButton:   document.getElementById("closeModalButton"),
    taskForm:           document.getElementById("taskForm"),
    taskTitle:          document.getElementById("taskTitle"),
    taskLane:           document.getElementById("taskLane"),
    taskUrgency:        document.getElementById("taskUrgency"),
    taskValue:          document.getElementById("taskValue"),
    taskArea:           document.getElementById("taskArea"),
    taskSource:         document.getElementById("taskSource"),
    taskNotes:          document.getElementById("taskNotes"),
    submitButton:       document.getElementById("submitButton"),
    cancelEditButton:   document.getElementById("cancelEditButton")
  };

  /* ── Boot ───────────────────────────────────────────────────────────────────── */

  function init() {
    const state   = readState();
    tasks         = state.tasks;
    boardColumns  = state.ui.boardColumns  || DEFAULT_BOARD_COLUMNS.map(c => Object.assign({}, c));
    collapsedCols = state.ui.collapsedCols || [];
    activeView    = state.ui.view          || "list";
    hiddenExpanded = Boolean(state.ui.hiddenExpanded);
    detailMode     = state.ui.detailMode   || "side";
    if (state.ui.cardVisibleProps) cardVisibleProps = Object.assign({}, DEFAULT_CARD_PROPS, state.ui.cardVisibleProps);
    if (Array.isArray(state.ui.detailPropOrder)) detailPropOrder = state.ui.detailPropOrder;
    if (state.ui.propLabels) propLabels = Object.assign({}, DEFAULT_PROP_LABELS, state.ui.propLabels);
    if (state.ui.propsCollapsed !== undefined) propsCollapsed = Boolean(state.ui.propsCollapsed);
    if (state.ui.listSort) listSort = state.ui.listSort;

    if (state.seedVersion !== tracker.seedVersion) {
      el.seedNotice.hidden = false;
      el.seedNotice.textContent = "Browser state is from an older seed. Reset if you want the latest baseline.";
    }

    el.storageStatus.textContent = "Self-contained: seed data in project-data.js + browser localStorage. No external database needed.";
    el.brandName.textContent     = data.project.name || "LTM";

    populateAreaSelect();
    populateLaneSelect();
    bindEvents();
    render();
  }

  /* ── State persistence ──────────────────────────────────────────────────────── */

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      return {
        seedVersion: parsed.seedVersion || "unknown",
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks.map(normalizeTask) : tracker.tasks.map(normalizeTask),
        ui: parsed.ui || {}
      };
    } catch (_) {
      return freshState();
    }
  }

  function freshState() {
    return {
      seedVersion: tracker.seedVersion,
      tasks: tracker.tasks.map(normalizeTask),
      ui: {}
    };
  }

  function writeState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      seedVersion: tracker.seedVersion,
      tasks,
      ui: {
        view:            activeView,
        boardColumns,
        collapsedCols,
        hiddenExpanded,
        detailMode,
        cardVisibleProps,
        detailPropOrder,
        propLabels,
        propsCollapsed,
        listSort
      },
      savedAt: new Date().toISOString()
    }));
  }

  /* ── Task normalisation ─────────────────────────────────────────────────────── */

  function normalizeTask(t) {
    const priority = t.priority || urgencyToPriority(t.urgency || 3);
    const urgency  = clamp(t.urgency || PRIORITY_TO_URGENCY[priority] || 3, 1, 5);
    const value    = Number.isFinite(Number(t.value)) ? Number(t.value) : (PRIORITY_TO_VALUE[priority] || 0);
    const lane     = normalizeLane(t);

    return {
      id:            t.id || createId(),
      title:         t.title || "Untitled Task",
      notes:         t.notes || "",
      body:          t.body  || "",   // rich-text HTML from detail panel editor
      lane,
      urgency,
      value,
      priority,
      area:          t.area          || "project-system",
      source:        t.source        || "user-requested",
      recommendedBy: t.recommendedBy || "",
      references:    Array.isArray(t.references) ? t.references : [],
      lastModified:  t.lastModified  || data.project.reviewedOn
    };
  }

  function normalizeLane(t) {
    if (t.lane === "processing-or-on-hold") return "processing";
    const all = ALL_LANES;
    if (t.lane && all.includes(t.lane)) return t.lane;
    switch (t.status) {
      case "done":        return "completed";
      case "in-progress": return "in-progress";
      case "blocked":     return "processing";
      default:            return "backlog";
    }
  }

  /* ── Event binding ──────────────────────────────────────────────────────────── */

  function bindEvents() {
    // Info panel
    el.toggleInfoButton.addEventListener("click", toggleInfo);
    el.exportJsonButton.addEventListener("click", exportJson);
    el.exportMarkdownButton.addEventListener("click", exportMarkdown);
    el.resetButton.addEventListener("click", resetToSeed);

    // View tabs
    el.listViewButton.addEventListener("click", () => setView("list"));
    el.boardViewButton.addEventListener("click", () => setView("board"));

    // Search / filter toggle
    el.searchToggle.addEventListener("click", () => toggleSearch());
    el.filterToggle.addEventListener("click", () => toggleFilter());
    el.searchInput.addEventListener("input", render);
    el.filterSelect.addEventListener("change", render);

    // Create button
    el.openCreateButton.addEventListener("click", () => openTaskModal(null));

    // Hidden lists toggle (list view)
    el.hiddenListsToggle.addEventListener("click", toggleHiddenLists);

    // Task modal
    el.closeModalButton.addEventListener("click", closeTaskModal);
    el.cancelEditButton.addEventListener("click", closeTaskModal);
    el.taskModal.addEventListener("click", e => { if (e.target === el.taskModal) closeTaskModal(); });
    el.taskForm.addEventListener("submit", handleTaskSubmit);

    // Detail panel
    el.detailBackdrop.addEventListener("click", closeDetail);
    el.detailCloseBtn.addEventListener("click", closeDetail);
    el.detailMarkDoneBtn.addEventListener("click", () => {
      const t = getTask(detailTaskId);
      if (!t) return;
      const isDone = DONE_LANES.includes(t.lane);
      moveTask(t.id, isDone ? "backlog" : "completed");
      refreshDetailProps(getTask(t.id));
    });
    el.detailDeleteBtn.addEventListener("click", () => {
      const t = getTask(detailTaskId);
      if (t && confirm("Delete this task?")) { deleteTask(t.id); closeDetail(); }
    });

    // Properties section collapse toggle
    el.detailPropsHeader.addEventListener("click", () => {
      propsCollapsed = !propsCollapsed;
      el.detailPropsSection.classList.toggle("collapsed", propsCollapsed);
      writeState();
    });

    // Detail panel view mode buttons
    el.detailModeSide.addEventListener("click",   () => setDetailMode("side"));
    el.detailModeCenter.addEventListener("click", () => setDetailMode("center"));
    el.detailModeFull.addEventListener("click",   () => setDetailMode("full"));

    // Detail title inline-edit auto-save
    el.detailTitle.addEventListener("blur", saveDetailTitle);
    el.detailTitle.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); el.detailTitle.blur(); }
    });

    // Notes editor — save on input (debounced)
    let saveTimer;
    el.notesEditor.addEventListener("input", () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveEditorContent, 500);
    });
    bindEditorShortcuts();

    // Column menu actions — capture key before closeColMenu() nulls activeColMenuKey
    el.colMenuRename.addEventListener("click", () => {
      const key = activeColMenuKey;
      closeColMenu();
      openRenameModal(key);
    });
    el.colMenuMoveLeft.addEventListener("click",  () => { moveColumn(activeColMenuKey, -1); closeColMenu(); });
    el.colMenuMoveRight.addEventListener("click", () => { moveColumn(activeColMenuKey,  1); closeColMenu(); });
    el.colMenuHide.addEventListener("click",  () => { hideColumn(activeColMenuKey);   closeColMenu(); });
    el.colMenuDelete.addEventListener("click", () => {
      const key = activeColMenuKey;
      closeColMenu();
      deleteColumn(key);
    });

    // Column color swatches
    el.colMenuSwatches.addEventListener("click", e => {
      const swatch = e.target.closest(".col-color-swatch");
      if (!swatch || !activeColMenuKey) return;
      const color = swatch.dataset.color;
      boardColumns = boardColumns.map(c =>
        c.key === activeColMenuKey ? Object.assign({}, c, { color }) : c
      );
      writeState();
      renderBoardView(filteredTasks());
      closeColMenu();
    });

    // Card fields popover
    el.cardFieldsBtn.addEventListener("click", e => {
      e.stopPropagation();
      const open = !el.cardFieldsPopover.hidden;
      el.cardFieldsPopover.hidden = open;
      el.cardFieldsBtn.setAttribute("aria-expanded", String(!open));
      el.cardFieldsBtn.classList.toggle("is-active", !open);
    });
    el.cfUrgency.addEventListener("change", () => { cardVisibleProps.urgency = el.cfUrgency.checked; writeState(); renderBoardView(filteredTasks()); });
    el.cfNotes.addEventListener("change",   () => { cardVisibleProps.notes   = el.cfNotes.checked;   writeState(); renderBoardView(filteredTasks()); });
    el.cfValue.addEventListener("change",   () => { cardVisibleProps.value   = el.cfValue.checked;   writeState(); renderBoardView(filteredTasks()); });
    el.cfArea.addEventListener("change",    () => { cardVisibleProps.area    = el.cfArea.checked;    writeState(); renderBoardView(filteredTasks()); });

    // Rename modal
    el.renameModalClose.addEventListener("click", closeRenameModal);
    el.renameCancel.addEventListener("click",     closeRenameModal);
    el.renameModal.addEventListener("click", e => { if (e.target === el.renameModal) closeRenameModal(); });
    el.renameConfirm.addEventListener("click", confirmRename);
    el.renameInput.addEventListener("keydown", e => { if (e.key === "Enter") confirmRename(); });

    // Add column modal
    el.addColModalClose.addEventListener("click", closeAddColModal);
    el.addColCancel.addEventListener("click",     closeAddColModal);
    el.addColModal.addEventListener("click", e => { if (e.target === el.addColModal) closeAddColModal(); });
    el.addColConfirm.addEventListener("click", confirmAddColumn);
    el.addColInput.addEventListener("keydown", e => { if (e.key === "Enter") confirmAddColumn(); });

    // Board column drag-to-reorder — container-level drop
    el.boardColumns.addEventListener("dragover", e => {
      if (colDragKey) e.preventDefault();
    });
    el.boardColumns.addEventListener("drop", e => {
      if (!colDragKey || colDropInsertIdx === null) return;
      e.preventDefault();
      clearColDropIndicators();
      const fromIdx = boardColumns.findIndex(c => c.key === colDragKey);
      if (fromIdx < 0) { colDragKey = null; colDropInsertIdx = null; return; }
      const copy = boardColumns.slice();
      const [moved] = copy.splice(fromIdx, 1);
      const adjusted = colDropInsertIdx > fromIdx ? colDropInsertIdx - 1 : colDropInsertIdx;
      copy.splice(adjusted, 0, moved);
      boardColumns = copy;
      colDragKey = null;
      colDropInsertIdx = null;
      writeState();
      renderBoardView(filteredTasks());
    });

    // Close menus on outside click
    document.addEventListener("click", e => {
      if (!el.colMenu.contains(e.target) && !e.target.closest(".board-col-menu-btn")) {
        closeColMenu();
      }
      if (!el.cardFieldsPopover.contains(e.target) && e.target !== el.cardFieldsBtn && !el.cardFieldsBtn.contains(e.target)) {
        el.cardFieldsPopover.hidden = true;
        el.cardFieldsBtn.classList.remove("is-active");
        el.cardFieldsBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Global keyboard shortcuts
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        if (!el.taskModal.hidden)   { closeTaskModal(); return; }
        if (!el.renameModal.hidden) { closeRenameModal(); return; }
        if (!el.addColModal.hidden) { closeAddColModal(); return; }
        if (!el.detailOverlay.hidden) { closeDetail(); return; }
      }
      const tag = document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement.isContentEditable) return;
      if (e.key === "n" || e.key === "N") openTaskModal(null);
      if (e.key === "/") { e.preventDefault(); toggleSearch(true); }
    });
  }

  /* ── Views ──────────────────────────────────────────────────────────────────── */

  function setView(view) {
    activeView = view;
    writeState();
    syncViewMode();
    render();
  }

  function syncViewMode() {
    const isList = activeView === "list";
    el.listView.hidden  =  !isList;
    el.boardView.hidden =   isList;
    el.listViewButton.classList.toggle("active", isList);
    el.boardViewButton.classList.toggle("active", !isList);
    el.listViewButton.setAttribute("aria-selected", String(isList));
    el.boardViewButton.setAttribute("aria-selected", String(!isList));
    // Card fields button only shows in board view
    el.cardFieldsBtn.hidden = isList;
    // Sync checkbox state
    el.cfUrgency.checked = cardVisibleProps.urgency;
    el.cfNotes.checked   = cardVisibleProps.notes;
    el.cfValue.checked   = cardVisibleProps.value;
    el.cfArea.checked    = cardVisibleProps.area;
  }

  /* ── Search / filter bar ────────────────────────────────────────────────────── */

  function toggleSearch(forceOpen) {
    const open = forceOpen != null ? forceOpen : !searchOpen;
    searchOpen = open;
    filterOpen = open;
    el.searchFilterBar.hidden = !open;
    el.searchToggle.classList.toggle("is-active", open);
    el.filterToggle.classList.toggle("is-active", open);
    el.searchToggle.setAttribute("aria-expanded", String(open));
    el.filterToggle.setAttribute("aria-expanded", String(open));
    if (open) el.searchInput.focus();
  }

  function toggleFilter() {
    toggleSearch();
  }

  /* ── Info panel ─────────────────────────────────────────────────────────────── */

  function toggleInfo() {
    const nextHidden = !el.infoDrawer.hidden;
    el.infoDrawer.hidden = nextHidden;
    el.toggleInfoButton.setAttribute("aria-expanded", String(!nextHidden));
  }

  /* ── Render pipeline ────────────────────────────────────────────────────────── */

  function render() {
    const filtered = filteredTasks();
    renderStats();
    renderFilterSummary(filtered);
    syncViewMode();
    if (activeView === "list") {
      renderListView(filtered);
    } else {
      renderBoardView(filtered);
    }
  }

  function renderStats() {
    const counts = {
      total:  tasks.length,
      active: tasks.filter(t => ACTIVE_LANES.includes(t.lane)).length,
      done:   tasks.filter(t => DONE_LANES.includes(t.lane)).length,
      urgent: tasks.filter(t => t.urgency >= 4).length
    };
    el.statsGrid.innerHTML = [
      { label: "Total",  value: counts.total  },
      { label: "Active", value: counts.active },
      { label: "Done",   value: counts.done   },
      { label: "Urgent", value: counts.urgent }
    ].map(s => `<div class="mini-stat"><strong>${s.value}</strong><span>${s.label}</span></div>`).join("");
  }

  function renderFilterSummary(filtered) {
    el.filterSummary.textContent = `${filtered.length} shown · ${tasks.length} total`;
  }

  /* ── Filter logic ───────────────────────────────────────────────────────────── */

  function filteredTasks() {
    const search = el.searchInput ? el.searchInput.value.trim().toLowerCase() : "";
    const filter = el.filterSelect ? el.filterSelect.value : "all";

    return tasks.filter(t => {
      if (search) {
        const haystack = [t.title, t.notes, t.id, LANE_LABELS[t.lane]].join(" ").toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      switch (filter) {
        case "active": return ACTIVE_LANES.includes(t.lane);
        case "done":   return DONE_LANES.includes(t.lane);
        case "urgent": return t.urgency >= 4;
        case "recommended": return t.source === "recommended";
        case "requested":   return t.source === "user-requested";
        default: return true;
      }
    });
  }

  /* ── LIST VIEW ──────────────────────────────────────────────────────────────── */

  function renderListView(filtered) {
    const active = filtered.filter(t => ACTIVE_LANES.includes(t.lane)).sort(sortTasks);

    // Sort bar
    let sortBar = document.getElementById("listSortBar");
    if (!sortBar) {
      sortBar = document.createElement("div");
      sortBar.id = "listSortBar";
      sortBar.className = "list-sort-bar";
      sortBar.innerHTML = `<span class="list-sort-label">Sort:</span>
        <button class="list-sort-btn" data-sort="urgency">Urgency</button>
        <span class="list-sort-sep">·</span>
        <button class="list-sort-btn" data-sort="value">Value</button>
        <span class="list-sort-sep">·</span>
        <button class="list-sort-btn" data-sort="modified">Modified</button>`;
      el.taskList.parentElement.insertBefore(sortBar, el.taskList);
      sortBar.addEventListener("click", e => {
        const btn = e.target.closest("[data-sort]");
        if (!btn) return;
        listSort = btn.dataset.sort;
        writeState();
        render();
      });
    }
    sortBar.querySelectorAll(".list-sort-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.sort === listSort);
    });

    el.taskList.innerHTML = "";

    if (!active.length) {
      el.taskList.innerHTML = '<div class="empty-state">No active tasks. Press N to add one.</div>';
    } else {
      active.forEach(t => el.taskList.appendChild(buildListRow(t)));
    }

    renderHiddenLists(filtered);
  }

  function buildListRow(task) {
    const row = document.createElement("article");
    row.className = "list-row" + (DONE_LANES.includes(task.lane) ? " is-done" : "");
    row.dataset.taskId = task.id;

    // Urgency dot
    const dot = document.createElement("span");
    dot.className = `list-urgency u-${task.urgency}`;
    dot.title = `Urgency ${task.urgency} / 5`;

    // Content
    const content = document.createElement("div");
    content.className = "list-content";

    const title = document.createElement("h3");
    title.className = "list-title";
    title.textContent = task.title;
    content.appendChild(title);

    const preview = plainPreview(task);
    if (preview) {
      const notes = document.createElement("p");
      notes.className = "list-notes";
      notes.textContent = preview;
      content.appendChild(notes);
    }

    // Lane pill
    const lane = document.createElement("span");
    lane.className = "list-lane";
    lane.textContent = LANE_LABELS[task.lane] || task.lane;

    // Hover tools
    const tools = document.createElement("div");
    tools.className = "list-tools";

    const doneBtn = document.createElement("button");
    doneBtn.className = "mark-done-btn";
    doneBtn.type = "button";
    doneBtn.textContent = DONE_LANES.includes(task.lane) ? "Move to backlog" : "✓ Done";
    doneBtn.addEventListener("click", e => {
      e.stopPropagation();
      const nextLane = DONE_LANES.includes(task.lane) ? "backlog" : "completed";
      moveTask(task.id, nextLane);
    });

    tools.appendChild(makeIconBtn("Edit", pencilIcon(), e => {
      e.stopPropagation();
      openTaskModal(task);
    }));
    tools.appendChild(doneBtn);

    row.appendChild(dot);
    row.appendChild(content);
    row.appendChild(lane);
    row.appendChild(tools);

    // Click anywhere on row opens detail
    row.addEventListener("click", () => openDetail(task.id));

    return row;
  }

  function renderHiddenLists(filtered) {
    const completed = filtered.filter(t => t.lane === "completed").sort(sortTasks);
    const archived  = filtered.filter(t => t.lane === "archived").sort(sortTasks);
    const total     = completed.length + archived.length;

    el.hiddenListsWrap.hidden = total === 0;
    el.hiddenListsCount.textContent = String(total);
    el.hiddenLists.hidden = !hiddenExpanded;
    el.hiddenListsToggle.setAttribute("aria-expanded", String(hiddenExpanded));

    if (!hiddenExpanded) return;

    el.hiddenLists.innerHTML = "";

    [[completed, "Completed"], [archived, "Archive"]].forEach(([taskArr, label]) => {
      if (!taskArr.length) return;
      const group = document.createElement("div");
      group.className = "hidden-group";
      group.innerHTML = `<div class="hidden-group-header"><h3>${label} <span style="color:var(--muted-soft)">${taskArr.length}</span></h3></div>`;
      const list = document.createElement("div");
      taskArr.forEach(t => list.appendChild(buildListRow(t)));
      group.appendChild(list);
      el.hiddenLists.appendChild(group);
    });
  }

  function toggleHiddenLists() {
    hiddenExpanded = !hiddenExpanded;
    writeState();
    renderHiddenLists(filteredTasks());
  }

  /* ── BOARD VIEW ─────────────────────────────────────────────────────────────── */

  function renderBoardView(filtered) {
    el.boardColumns.innerHTML    = "";
    el.boardHiddenChips.innerHTML = "";
    let hasCollapsed = false;

    boardColumns.forEach((col, boardIdx) => {
      const isCollapsed = collapsedCols.includes(col.key);
      const colTasks    = filtered.filter(t => col.lanes.includes(t.lane)).sort(sortTasks);

      if (isCollapsed) {
        el.boardHiddenChips.appendChild(buildCollapsedChip(col, colTasks.length));
        hasCollapsed = true;
      } else {
        // Drop indicator before this column
        const ind = document.createElement("div");
        ind.className = "col-drop-indicator";
        ind.dataset.insertIdx = String(boardIdx);
        el.boardColumns.appendChild(ind);

        el.boardColumns.appendChild(buildExpandedColumn(col, colTasks));
      }
    });

    // Trailing drop indicator (after last expanded column)
    const trailInd = document.createElement("div");
    trailInd.className = "col-drop-indicator";
    trailInd.dataset.insertIdx = String(boardColumns.length);
    el.boardColumns.appendChild(trailInd);

    el.boardCollapsedStrip.hidden = !hasCollapsed;

    // "+" add column button
    const addBtn = document.createElement("button");
    addBtn.className = "board-add-column";
    addBtn.title = "Add column";
    addBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    addBtn.addEventListener("click", openAddColModal);
    el.boardColumns.appendChild(addBtn);
  }

  function buildExpandedColumn(col, colTasks) {
    const section = document.createElement("section");
    section.className = "board-column" + (col.color ? ` col-color-${col.color}` : "");
    section.dataset.colKey = col.key;

    // Column drag-to-reorder
    section.draggable = true;
    section.addEventListener("dragstart", e => {
      // Only start if dragging the header area (not a card)
      if (e.target.closest(".board-card")) { e.preventDefault(); return; }
      colDragKey = col.key;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => section.classList.add("col-dragging"), 0);
    });
    section.addEventListener("dragend", () => {
      colDragKey = null;
      colDropInsertIdx = null;
      section.classList.remove("col-dragging");
      clearColDropIndicators();
    });
    section.addEventListener("dragover", e => {
      if (!colDragKey || colDragKey === col.key) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const fromIdx = boardColumns.findIndex(c => c.key === colDragKey);
      const colIdx  = boardColumns.findIndex(c => c.key === col.key);
      const rect    = section.getBoundingClientRect();
      const insertIdx = e.clientX < rect.left + rect.width / 2 ? colIdx : colIdx + 1;
      if (insertIdx !== colDropInsertIdx) {
        colDropInsertIdx = insertIdx;
        updateColDropIndicators(fromIdx);
      }
    });

    // Header
    const header = document.createElement("div");
    header.className = "board-column-header";
    if (col.color) header.classList.add(`col-header-${col.color}`);

    const left = document.createElement("div");
    left.className = "board-column-header-left";

    // Drag grip icon (always visible in header)
    const grip = document.createElement("span");
    grip.className = "col-drag-grip";
    grip.title = "Drag to reorder";
    grip.innerHTML = `<svg width="10" height="12" viewBox="0 0 10 14" fill="none"><circle cx="3" cy="2.5" r="1.1" fill="currentColor"/><circle cx="7" cy="2.5" r="1.1" fill="currentColor"/><circle cx="3" cy="7" r="1.1" fill="currentColor"/><circle cx="7" cy="7" r="1.1" fill="currentColor"/><circle cx="3" cy="11.5" r="1.1" fill="currentColor"/><circle cx="7" cy="11.5" r="1.1" fill="currentColor"/></svg>`;

    const titleEl = document.createElement("div");
    titleEl.className = "board-column-title";
    titleEl.textContent = col.label;
    titleEl.title = "Click to rename";
    titleEl.addEventListener("click", e => { e.stopPropagation(); openRenameModal(col.key); });

    const countEl = document.createElement("div");
    countEl.className = "board-column-count";
    countEl.textContent = String(colTasks.length);

    left.appendChild(grip);
    left.appendChild(titleEl);
    left.appendChild(countEl);

    const headerTools = document.createElement("div");
    headerTools.className = "board-column-header-tools";

    const addBtn = document.createElement("button");
    addBtn.className = "board-col-add-btn";
    addBtn.type = "button";
    addBtn.title = "New item";
    addBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    addBtn.addEventListener("click", e => { e.stopPropagation(); openInlineNew(col, body); });

    const menuBtn = document.createElement("button");
    menuBtn.className = "board-col-menu-btn";
    menuBtn.type = "button";
    menuBtn.title = "Column options";
    menuBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>`;
    menuBtn.addEventListener("click", e => { e.stopPropagation(); openColMenu(col.key, menuBtn); });

    headerTools.appendChild(addBtn);
    headerTools.appendChild(menuBtn);
    header.appendChild(left);
    header.appendChild(headerTools);

    // Body (drop zone)
    const body = document.createElement("div");
    body.className = "board-column-body";
    body.dataset.dropLane = col.dropLane;
    bindDropZone(body);

    if (!colTasks.length) {
      const empty = document.createElement("div");
      empty.className = "board-empty";
      empty.textContent = "Drop here";
      body.appendChild(empty);
    } else {
      colTasks.forEach(t => body.appendChild(buildBoardCard(t)));
    }

    // Footer
    const footer = document.createElement("div");
    footer.className = "board-column-footer";
    const newItemBtn = document.createElement("button");
    newItemBtn.className = "board-col-new-btn";
    newItemBtn.type = "button";
    newItemBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New item`;
    newItemBtn.addEventListener("click", () => openInlineNew(col, body));
    footer.appendChild(newItemBtn);

    section.appendChild(header);
    section.appendChild(body);
    section.appendChild(footer);

    return section;
  }

  function buildCollapsedChip(col, count) {
    const chip = document.createElement("button");
    chip.className = "board-hidden-chip" + (col.color ? ` col-chip-${col.color}` : "");
    chip.type = "button";
    chip.title = `Expand "${col.label}"`;
    chip.dataset.colKey = col.key;

    const countEl = document.createElement("span");
    countEl.className = "chip-count";
    countEl.textContent = String(count);

    const labelEl = document.createElement("span");
    labelEl.className = "chip-label";
    labelEl.textContent = col.label;

    const expandIcon = document.createElement("span");
    expandIcon.className = "chip-expand";
    expandIcon.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

    chip.appendChild(countEl);
    chip.appendChild(labelEl);
    chip.appendChild(expandIcon);
    chip.addEventListener("click", () => expandColumn(col.key));

    return chip;
  }

  function buildBoardCard(task) {
    const card = document.createElement("article");
    card.className = "board-card" + (DONE_LANES.includes(task.lane) ? " is-done" : "");
    card.draggable = true;
    card.dataset.taskId = task.id;

    card.addEventListener("dragstart", e => {
      if (colDragKey) { e.stopPropagation(); return; } // don't interfere with col drag
      dragTaskId = task.id;
      setTimeout(() => card.classList.add("is-dragging"), 0);
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      dragTaskId = null;
      card.classList.remove("is-dragging");
    });

    const top = document.createElement("div");
    top.className = "board-card-top";

    const topLeft = document.createElement("div");
    topLeft.className = "board-card-top-left";

    if (cardVisibleProps.urgency) {
      const dot = document.createElement("span");
      dot.className = `list-urgency u-${task.urgency}`;
      dot.title = `Urgency ${task.urgency} / 5`;
      topLeft.appendChild(dot);
    }

    if (cardVisibleProps.value && task.value) {
      const chip = document.createElement("span");
      chip.className = "card-prop-chip";
      chip.textContent = `$${task.value.toLocaleString()}`;
      topLeft.appendChild(chip);
    }

    if (cardVisibleProps.area && task.area) {
      const chip = document.createElement("span");
      chip.className = "card-prop-chip";
      chip.textContent = task.area;
      topLeft.appendChild(chip);
    }

    const tools = document.createElement("div");
    tools.className = "board-card-tools";
    tools.appendChild(makeIconBtn("Edit task", pencilIcon(), e => {
      e.stopPropagation();
      openTaskModal(task);
    }));
    tools.appendChild(makeIconBtn("Delete task", trashIcon(), e => {
      e.stopPropagation();
      if (confirm("Delete this task?")) deleteTask(task.id);
    }));

    top.appendChild(topLeft);
    top.appendChild(tools);

    const title = document.createElement("h3");
    title.className = "board-card-title";
    title.textContent = task.title;

    card.appendChild(top);
    card.appendChild(title);

    if (cardVisibleProps.notes) {
      const preview = plainPreview(task);
      if (preview) {
        const notes = document.createElement("p");
        notes.className = "board-card-notes";
        notes.textContent = preview;
        card.appendChild(notes);
      }
    }

    card.addEventListener("click", () => openDetail(task.id));

    return card;
  }

  function clearColDropIndicators() {
    el.boardColumns.querySelectorAll(".col-drop-indicator").forEach(d => d.classList.remove("active"));
  }

  function updateColDropIndicators(fromIdx) {
    const noChange = colDropInsertIdx === fromIdx || colDropInsertIdx === fromIdx + 1;
    el.boardColumns.querySelectorAll(".col-drop-indicator").forEach(d => {
      d.classList.toggle("active", !noChange && parseInt(d.dataset.insertIdx) === colDropInsertIdx);
    });
  }

  function bindDropZone(body) {
    body.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      body.classList.add("drag-over");
    });
    body.addEventListener("dragleave", e => {
      if (!body.contains(e.relatedTarget)) body.classList.remove("drag-over");
    });
    body.addEventListener("drop", e => {
      e.preventDefault();
      body.classList.remove("drag-over");
      if (dragTaskId) moveTask(dragTaskId, body.dataset.dropLane);
    });
  }

  /* ── Column management ──────────────────────────────────────────────────────── */

  function openColMenu(colKey, anchorEl) {
    activeColMenuKey = colKey;
    const col = boardColumns.find(c => c.key === colKey);
    const idx = boardColumns.findIndex(c => c.key === colKey);
    el.colMenuMoveLeft.disabled  = idx <= 0;
    el.colMenuMoveRight.disabled = idx >= boardColumns.length - 1;

    // Highlight active color swatch
    const currentColor = col ? (col.color || "") : "";
    el.colMenuSwatches.querySelectorAll(".col-color-swatch").forEach(s => {
      s.classList.toggle("active", s.dataset.color === currentColor);
    });

    const rect = anchorEl.getBoundingClientRect();
    el.colMenu.style.top  = (rect.bottom + 4) + "px";
    el.colMenu.style.left = Math.min(rect.left, window.innerWidth - 200) + "px";
    el.colMenu.hidden = false;
  }

  function closeColMenu() {
    el.colMenu.hidden = true;
    activeColMenuKey = null;
  }

  function moveColumn(colKey, dir) {
    const idx = boardColumns.findIndex(c => c.key === colKey);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= boardColumns.length) return;
    const copy = boardColumns.slice();
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    boardColumns = copy;
    writeState();
    renderBoardView(filteredTasks());
  }

  function hideColumn(colKey) {
    if (!collapsedCols.includes(colKey)) collapsedCols.push(colKey);
    writeState();
    renderBoardView(filteredTasks());
  }

  function expandColumn(colKey) {
    collapsedCols = collapsedCols.filter(k => k !== colKey);
    writeState();
    renderBoardView(filteredTasks());
  }

  function openRenameModal(colKey) {
    const col = boardColumns.find(c => c.key === colKey);
    if (!col) return;
    renamingColKey = colKey;
    el.renameInput.value = col.label;
    el.renameModal.hidden = false;
    el.renameInput.focus();
    el.renameInput.select();
  }

  function closeRenameModal() {
    el.renameModal.hidden = true;
    renamingColKey = null;
  }

  function confirmRename() {
    const val = el.renameInput.value.trim();
    if (!val || !renamingColKey) return;
    boardColumns = boardColumns.map(c =>
      c.key === renamingColKey ? Object.assign({}, c, { label: val }) : c
    );
    closeRenameModal();
    writeState();
    renderBoardView(filteredTasks());
  }

  function deleteColumn(colKey) {
    const col = boardColumns.find(c => c.key === colKey);
    if (!col) return;

    // Count tasks in this column
    const count = tasks.filter(t => col.lanes.includes(t.lane)).length;
    const msg   = count > 0
      ? `Delete column "${col.label}"? The ${count} task(s) will be moved to Backlog.`
      : `Delete column "${col.label}"?`;

    if (!confirm(msg)) return;

    // Move tasks to backlog
    tasks = tasks.map(t =>
      col.lanes.includes(t.lane) ? Object.assign({}, t, { lane: "backlog", lastModified: today() }) : t
    );
    boardColumns  = boardColumns.filter(c => c.key !== colKey);
    collapsedCols = collapsedCols.filter(k => k !== colKey);
    writeState();
    renderBoardView(filteredTasks());
  }

  function openAddColModal() {
    el.addColInput.value = "";
    el.addColModal.hidden = false;
    el.addColInput.focus();
  }

  function closeAddColModal() {
    el.addColModal.hidden = true;
  }

  function confirmAddColumn() {
    const name = el.addColInput.value.trim();
    if (!name) return;
    const key = "custom-" + Date.now();
    boardColumns.push({
      key,
      label:    name,
      lanes:    [key],       // custom lane key matching column key
      dropLane: key
    });
    // Ensure ALL_LANES, ACTIVE_LANES, and LANE_LABELS know about this (so tasks appear in list view)
    if (!ALL_LANES.includes(key))    ALL_LANES.push(key);
    if (!ACTIVE_LANES.includes(key)) ACTIVE_LANES.push(key);
    LANE_LABELS[key] = name;
    closeAddColModal();
    writeState();
    renderBoardView(filteredTasks());
  }

  /* ── Task detail panel ──────────────────────────────────────────────────────── */

  function setDetailMode(mode) {
    detailMode = mode;
    applyDetailMode();
    writeState();
  }

  function applyDetailMode() {
    el.detailPanel.classList.remove("mode-side", "mode-center", "mode-full");
    el.detailPanel.classList.add("mode-" + detailMode);
    // backdrop: hidden in full mode (no need to click behind)
    el.detailBackdrop.style.display = detailMode === "full" ? "none" : "";
    // Update active button
    [el.detailModeSide, el.detailModeCenter, el.detailModeFull].forEach(btn => btn.classList.remove("active"));
    const modeBtn = { side: el.detailModeSide, center: el.detailModeCenter, full: el.detailModeFull }[detailMode];
    if (modeBtn) modeBtn.classList.add("active");
    // Overlay layout adjusts per mode
    el.detailOverlay.dataset.mode = detailMode;
  }

  function openDetail(taskId) {
    detailTaskId = taskId;
    const t = getTask(taskId);
    if (!t) return;

    el.detailTitle.textContent = t.title;
    refreshDetailProps(t);
    setEditorContent(t.body || t.notes || "");

    el.detailPropsSection.classList.toggle("collapsed", propsCollapsed);
    el.detailOverlay.hidden = false;
    applyDetailMode();
    document.body.style.overflow = "hidden";
  }

  function closeDetail() {
    saveDetailTitle();
    saveEditorContent();
    el.detailOverlay.hidden = true;
    detailTaskId = null;
    document.body.style.overflow = "";
  }

  function refreshDetailProps(t) {
    el.detailProps.innerHTML = "";

    const isDone = DONE_LANES.includes(t.lane);

    detailPropOrder.forEach((propKey, idx) => {
      const row = document.createElement("div");
      row.className = "detail-prop-row";
      row.draggable = true;
      row.dataset.propKey = propKey;
      row.dataset.idx = idx;

      // Drag handle
      const handle = document.createElement("span");
      handle.className = "prop-drag-handle";
      handle.innerHTML = `<svg width="10" height="14" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.2" fill="currentColor"/><circle cx="7" cy="3" r="1.2" fill="currentColor"/><circle cx="3" cy="8" r="1.2" fill="currentColor"/><circle cx="7" cy="8" r="1.2" fill="currentColor"/><circle cx="3" cy="13" r="1.2" fill="currentColor"/><circle cx="7" cy="13" r="1.2" fill="currentColor"/></svg>`;

      // Label (click to rename)
      const labelEl = document.createElement("div");
      labelEl.className = "detail-prop-label";
      labelEl.textContent = propLabels[propKey] || propKey;
      labelEl.title = "Click to rename";
      labelEl.addEventListener("click", () => startPropLabelEdit(labelEl, propKey));

      // Value (inline editable)
      const valueEl = document.createElement("div");
      valueEl.className = "detail-prop-value";
      buildPropValue(valueEl, propKey, t);

      row.appendChild(handle);
      row.appendChild(labelEl);
      row.appendChild(valueEl);

      // Drag events for reordering
      row.addEventListener("dragstart", e => {
        propDragSrcIdx = idx;
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => row.classList.add("prop-dragging"), 0);
      });
      row.addEventListener("dragend", () => {
        propDragSrcIdx = null;
        row.classList.remove("prop-dragging");
        document.querySelectorAll(".detail-prop-row").forEach(r => r.classList.remove("prop-drag-over"));
      });
      row.addEventListener("dragover", e => {
        e.preventDefault();
        if (propDragSrcIdx == null || propDragSrcIdx === idx) return;
        document.querySelectorAll(".detail-prop-row").forEach(r => r.classList.remove("prop-drag-over"));
        row.classList.add("prop-drag-over");
      });
      row.addEventListener("drop", e => {
        e.preventDefault();
        if (propDragSrcIdx == null || propDragSrcIdx === idx) return;
        const newOrder = [...detailPropOrder];
        const [moved] = newOrder.splice(propDragSrcIdx, 1);
        newOrder.splice(idx, 0, moved);
        detailPropOrder = newOrder;
        writeState();
        refreshDetailProps(getTask(detailTaskId));
      });

      el.detailProps.appendChild(row);
    });

    // Action rows: Mark done / Delete
    const doneRow = document.createElement("div");
    doneRow.className = "detail-prop-action-row detail-prop-action-row--done";
    doneRow.innerHTML = isDone
      ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><line x1="20" y1="9" x2="4" y2="9"/><line x1="20" y1="15" x2="10" y2="15"/><polyline points="15 20 20 15 15 10"/></svg> Move to backlog`
      : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Mark as done`;
    doneRow.addEventListener("click", () => el.detailMarkDoneBtn.click());
    el.detailProps.appendChild(doneRow);

    const deleteRow = document.createElement("div");
    deleteRow.className = "detail-prop-action-row detail-prop-action-row--delete";
    deleteRow.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg> Delete task`;
    deleteRow.addEventListener("click", () => el.detailDeleteBtn.click());
    el.detailProps.appendChild(deleteRow);
  }

  function startPropLabelEdit(labelEl, propKey) {
    const input = document.createElement("input");
    input.className = "prop-label-input";
    input.value = propLabels[propKey] || propKey;
    input.style.cssText = "width:100%;background:transparent;border:none;outline:none;font:inherit;font-weight:600;color:var(--muted-soft);padding:0;";
    labelEl.textContent = "";
    labelEl.appendChild(input);
    input.focus();
    input.select();
    const save = () => {
      const v = input.value.trim();
      if (v) propLabels[propKey] = v;
      writeState();
      labelEl.textContent = propLabels[propKey] || propKey;
    };
    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
      if (e.key === "Escape") { labelEl.textContent = propLabels[propKey] || propKey; }
    });
  }

  function buildPropValue(container, propKey, t) {
    const colDef   = boardColumns.find(c => c.lanes.includes(t.lane));
    const colLabel = colDef ? colDef.label : (LANE_LABELS[t.lane] || t.lane);

    switch (propKey) {
      case "stage": {
        const sel = document.createElement("select");
        sel.className = "detail-prop-select";
        // All active columns plus done columns
        boardColumns.forEach(col => {
          const opt = document.createElement("option");
          opt.value = col.dropLane;
          opt.textContent = col.label;
          if (col.lanes.includes(t.lane)) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener("change", () => {
          moveTask(t.id, sel.value);
          refreshDetailProps(getTask(detailTaskId));
        });
        container.appendChild(sel);
        break;
      }
      case "urgency": {
        const sel = document.createElement("select");
        sel.className = "detail-prop-select";
        for (let u = 1; u <= 5; u++) {
          const opt = document.createElement("option");
          opt.value = String(u);
          opt.textContent = u === 1 ? "1 — Low" : u === 3 ? "3 — Medium" : u === 5 ? "5 — Critical" : String(u);
          if (u === t.urgency) opt.selected = true;
          sel.appendChild(opt);
        }
        sel.addEventListener("change", () => {
          const newUrgency = Number(sel.value);
          tasks = tasks.map(x => x.id === t.id ? Object.assign({}, x, { urgency: newUrgency, priority: urgencyToPriority(newUrgency), lastModified: today() }) : x);
          writeState(); render();
        });
        container.appendChild(sel);
        break;
      }
      case "value": {
        const inp = document.createElement("input");
        inp.type = "number";
        inp.min = "0";
        inp.step = "100";
        inp.value = t.value || "";
        inp.placeholder = "—";
        inp.style.cssText = "background:transparent;border:none;outline:none;font:inherit;font-size:0.82rem;color:var(--text);padding:0;width:100%;";
        inp.addEventListener("change", () => {
          const v = Number(inp.value) || 0;
          tasks = tasks.map(x => x.id === t.id ? Object.assign({}, x, { value: v, lastModified: today() }) : x);
          writeState(); render();
        });
        container.appendChild(inp);
        break;
      }
      case "area": {
        const sel = document.createElement("select");
        sel.className = "detail-prop-select";
        tracker.areas.forEach(area => {
          const opt = document.createElement("option");
          opt.value = area;
          opt.textContent = area;
          if (area === t.area) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener("change", () => {
          tasks = tasks.map(x => x.id === t.id ? Object.assign({}, x, { area: sel.value, lastModified: today() }) : x);
          writeState(); render();
        });
        container.appendChild(sel);
        break;
      }
      case "modified":
      default: {
        container.textContent = (propKey === "modified" ? t.lastModified : "—") || "—";
        break;
      }
    }
  }

  function saveDetailTitle() {
    const t = getTask(detailTaskId);
    if (!t) return;
    const newTitle = (el.detailTitle.textContent || "").trim();
    if (!newTitle || newTitle === t.title) return;
    tasks = tasks.map(x =>
      x.id === detailTaskId ? Object.assign({}, x, { title: newTitle, lastModified: today() }) : x
    );
    writeState();
    render();
  }

  /* ── Editor helpers (BlockNote-ready interface) ─────────────────────────────── */

  function getEditorContent() {
    return el.notesEditor.innerHTML;
  }

  function setEditorContent(html) {
    el.notesEditor.innerHTML = sanitizeHtml(html);
  }

  function saveEditorContent() {
    const t = getTask(detailTaskId);
    if (!t) return;
    const html  = getEditorContent();
    const plain = el.notesEditor.textContent.trim();
    tasks = tasks.map(x =>
      x.id === detailTaskId
        ? Object.assign({}, x, { body: html, notes: plain, lastModified: today() })
        : x
    );
    writeState();
  }

  function sanitizeHtml(html) {
    if (!html) return "";
    // Allow only safe inline/block tags
    const allowed = /^(p|br|strong|b|em|i|u|ul|ol|li|h2|h3|a|span)$/i;
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll("*").forEach(node => {
      if (!allowed.test(node.tagName)) {
        node.replaceWith(...Array.from(node.childNodes));
      }
    });
    return div.innerHTML;
  }

  function bindEditorShortcuts() {
    el.notesEditor.addEventListener("keydown", e => {
      // Cmd/Ctrl + B = bold
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        document.execCommand("bold");
      }
      // Cmd/Ctrl + I = italic
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        document.execCommand("italic");
      }
      // Cmd/Ctrl + Shift + 8 = bullet list
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "8") {
        e.preventDefault();
        document.execCommand("insertUnorderedList");
      }
      // Prevent navigating away from editor with Escape — handled at doc level
    });

    // Auto bullet: typing "- " at the start of a blank line
    el.notesEditor.addEventListener("input", e => {
      if (e.inputType !== "insertText") return;
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const node  = range.startContainer;
      if (node.nodeType !== Node.TEXT_NODE) return;
      if (node.textContent === "- ") {
        e.preventDefault();
        document.execCommand("delete");
        document.execCommand("delete");
        document.execCommand("insertUnorderedList");
      }
    });
  }

  /* ── Task mutations ─────────────────────────────────────────────────────────── */

  function moveTask(taskId, nextLane) {
    tasks = tasks.map(t =>
      t.id === taskId ? Object.assign({}, t, { lane: nextLane, lastModified: today() }) : t
    );
    writeState();
    render();
    // Refresh detail panel if open
    if (detailTaskId === taskId) refreshDetailProps(getTask(taskId));
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    writeState();
    render();
  }

  /* ── Task modal (create / edit) ─────────────────────────────────────────────── */

  function openTaskModal(task, defaultLane) {
    editingId = task ? task.id : null;
    el.modalTitle.textContent  = task ? "Edit Task" : "New Task";
    el.submitButton.textContent = task ? "Save Changes" : "Save Task";
    el.taskModal.hidden = false;

    if (task) {
      el.taskTitle.value   = task.title;
      el.taskLane.value    = task.lane;
      el.taskUrgency.value = String(task.urgency);
      el.taskValue.value   = String(task.value);
      el.taskArea.value    = task.area;
      el.taskSource.value  = task.source;
      el.taskNotes.value   = task.notes || "";
    } else {
      el.taskForm.reset();
      el.taskLane.value    = defaultLane || "newly-added-or-updated";
      el.taskUrgency.value = "3";
      el.taskArea.value    = "project-system";
      el.taskSource.value  = "user-requested";
    }
  }

  function closeTaskModal() {
    el.taskModal.hidden = true;
    editingId = null;
    el.taskForm.reset();
  }

  function handleTaskSubmit(e) {
    e.preventDefault();
    const title = el.taskTitle.value.trim();
    if (!title) return;

    const urgency  = clamp(Number(el.taskUrgency.value) || 3, 1, 5);
    const priority = urgencyToPriority(urgency);
    const lane     = el.taskLane.value;

    const nextTask = {
      id:            editingId || createId(),
      title,
      notes:         el.taskNotes.value.trim(),
      body:          editingId ? (getTask(editingId)?.body || "") : "",
      lane,
      urgency,
      value:         Number(el.taskValue.value || 0),
      priority,
      area:          el.taskArea.value,
      source:        el.taskSource.value,
      recommendedBy: el.taskSource.value === "recommended" ? (tracker.recommendedByLabel || "") : "",
      references:    editingId ? (getTask(editingId)?.references || []) : [],
      lastModified:  today()
    };

    if (editingId) {
      tasks = tasks.map(t => t.id === editingId ? nextTask : t);
    } else {
      tasks.unshift(nextTask);
    }

    writeState();
    closeTaskModal();
    render();
  }

  /* ── Inline new-item form (board view) ─────────────────────────────────────── */

  function openInlineNew(col, bodyEl) {
    // Close any open inline form first; if one already exists in this column, just remove it
    const existing = document.querySelector(".board-inline-new");
    if (existing) {
      const inSameCol = bodyEl.contains(existing);
      existing.remove();
      if (inSameCol) return; // toggle off
    }

    const form = document.createElement("div");
    form.className = "board-inline-new";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "board-inline-new-title";
    titleInput.placeholder = "Task title…";
    titleInput.autocomplete = "off";

    const props = document.createElement("div");
    props.className = "board-inline-new-props";

    const urgencySelect = document.createElement("select");
    urgencySelect.className = "board-inline-new-select";
    [["1","1 — Low"],["2","2"],["3","3 — Medium"],["4","4 — High"],["5","5 — Critical"]].forEach(([v, t]) => {
      const opt = document.createElement("option");
      opt.value = v; opt.textContent = t;
      if (v === "3") opt.selected = true;
      urgencySelect.appendChild(opt);
    });

    const hint = document.createElement("span");
    hint.className = "board-inline-new-hint";
    hint.textContent = "↵ save · Esc cancel";

    props.appendChild(urgencySelect);
    props.appendChild(hint);

    const actions = document.createElement("div");
    actions.className = "board-inline-new-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "board-inline-new-cancel";
    cancelBtn.textContent = "Cancel";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "board-inline-new-save";
    saveBtn.textContent = "Add";

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    form.appendChild(titleInput);
    form.appendChild(props);
    form.appendChild(actions);

    bodyEl.appendChild(form);
    titleInput.focus();

    function save() {
      const title = titleInput.value.trim();
      if (!title) { titleInput.focus(); return; }
      const urgency = clamp(Number(urgencySelect.value) || 3, 1, 5);
      const newTask = {
        id:            createId(),
        title,
        notes:         "",
        body:          "",
        lane:          col.dropLane,
        urgency,
        value:         0,
        priority:      urgencyToPriority(urgency),
        area:          tracker.areas[0] || "",
        source:        "user-requested",
        recommendedBy: "",
        references:    [],
        lastModified:  today()
      };
      tasks.unshift(newTask);
      writeState();
      render();
    }

    saveBtn.addEventListener("click", save);
    cancelBtn.addEventListener("click", () => form.remove());
    titleInput.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); save(); }
      if (e.key === "Escape") { form.remove(); }
    });
  }

  /* ── Select population ──────────────────────────────────────────────────────── */

  function populateAreaSelect() {
    tracker.areas.forEach(area => {
      const opt = document.createElement("option");
      opt.value = area;
      opt.textContent = area;
      el.taskArea.appendChild(opt);
    });
  }

  function populateLaneSelect() {
    ACTIVE_LANES.concat(DONE_LANES).forEach(lane => {
      const opt = document.createElement("option");
      opt.value = lane;
      opt.textContent = LANE_LABELS[lane] || lane;
      el.taskLane.appendChild(opt);
    });
  }

  /* ── Sorting ────────────────────────────────────────────────────────────────── */

  function sortTasks(a, b) {
    switch (listSort) {
      case "value":
        if (b.value   !== a.value)   return b.value   - a.value;
        if (b.urgency !== a.urgency) return b.urgency - a.urgency;
        return String(b.lastModified).localeCompare(String(a.lastModified));
      case "modified":
        return String(b.lastModified).localeCompare(String(a.lastModified));
      default: // "urgency"
        if (b.urgency !== a.urgency) return b.urgency - a.urgency;
        if (b.value   !== a.value)   return b.value   - a.value;
        return String(b.lastModified).localeCompare(String(a.lastModified));
    }
  }

  /* ── Export ─────────────────────────────────────────────────────────────────── */

  function exportJson() {
    const dt = today();
    download(
      `ltm-tasks-${dt}.json`,
      JSON.stringify({ project: data.project, exportedAt: new Date().toISOString(), tasks }, null, 2),
      "application/json"
    );
  }

  function exportMarkdown() {
    const dt    = today();
    const lines = ["# LTM Tasks", "", `Exported: ${new Date().toISOString()}`, "", "## Tasks", ""];
    tasks.slice().sort(sortTasks).forEach(t => {
      lines.push(`- ${t.title} | ${LANE_LABELS[t.lane] || t.lane} | urgency ${t.urgency}`);
      if (t.notes) lines.push(`  Notes: ${t.notes}`);
      lines.push("");
    });
    download(`ltm-tasks-${dt}.md`, lines.join("\n"), "text/markdown");
  }

  function resetToSeed() {
    if (!confirm("Reset to seed? All local edits will be removed.")) return;
    tasks         = tracker.tasks.map(normalizeTask);
    boardColumns  = DEFAULT_BOARD_COLUMNS.map(c => Object.assign({}, c));
    collapsedCols = [];
    hiddenExpanded = false;
    el.seedNotice.hidden = true;
    writeState();
    render();
  }

  /* ── Utilities ──────────────────────────────────────────────────────────────── */

  function getTask(id) { return tasks.find(t => t.id === id); }

  function plainPreview(task) {
    if (task.body) return task.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    return (task.notes || "").slice(0, 120);
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function createId() { return "LOCAL-" + Date.now(); }
  function clamp(v, min, max) { const n = Number(v); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min; }

  function urgencyToPriority(u) {
    if (u >= 5) return "P0";
    if (u >= 4) return "P1";
    if (u >= 3) return "P2";
    return "P3";
  }

  function download(name, content, type) {
    const a = document.createElement("a");
    a.href     = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function makeIconBtn(label, svg, handler) {
    const btn = document.createElement("button");
    btn.className = "icon-button";
    btn.type = "button";
    btn.setAttribute("aria-label", label);
    btn.innerHTML = svg;
    btn.addEventListener("click", handler);
    return btn;
  }

  function pencilIcon() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
  }

  function trashIcon() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>`;
  }

  /* ── Boot ───────────────────────────────────────────────────────────────────── */

  init();

})();
