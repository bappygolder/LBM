/* ──────────────────────────────────────────────────────────────────────────────
   LBM — Local Business Manager · task-app.js
   Vanilla JS, no build step.

   NOTE on the notes editor: uses contenteditable with basic formatting support.
   It is designed to be replaced with BlockNote (React) in a future migration.
   The getEditorContent() / setEditorContent() helpers make the swap clean.
────────────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const data = window.MCCProjectData || {
    project: {
      name: "LBM",
      fullName: "Local Business Manager",
      reviewedOn: new Date().toISOString().split('T')[0],
      maintainedBy: "Local User",
      summary: "Standalone local task tracker."
    },
    tracker: {
      storageKey: "lbm-local-task-tracker",
      seedVersion: "1.0",
      recommendedByLabel: "System",
      areas: ["general"],
      tasks: []
    },
    docs: [],
    skills: []
  };
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
  let activeBarMode = null; // null | "search"
  let activeFilter  = "all"; // "all" | "active" | "done" | "urgent" | "recommended" | "requested"

  let editingId         = null; // task being edited in the modal
  let detailTaskId      = null; // task shown in detail panel
  let activeColMenuKey  = null; // column key for the open 3-dot menu
  let renamingColKey    = null; // column key being renamed
  let dragTaskId        = null;
  let colDragKey        = null; // column key being dragged for reorder
  let colDropInsertIdx  = null; // insertion index during column drag (0 = before first)

  // Multi-select state
  let selectedTaskIds  = new Set(); // task IDs currently selected via lasso drag
  let lassoActive      = false;
  let lassoStart       = { x: 0, y: 0 };
  let lassoEl          = null; // the rubber-band rect element
  let listDragMultiIds = []; // ordered IDs being dragged together in list view

  // Detail panel view mode: "side" | "center" | "full"
  let detailMode = "side";

  // List view sort: "criteria" | "manual"
  let listSort = "manual";

  // Multi-level sort criteria order (all three always active, in priority order)
  let sortCriteriaOrder = ["urgency", "value", "modified"];

  // Sort direction per criterion: "desc" = high/newest first, "asc" = low/oldest first
  let sortDirs = { urgency: "desc", value: "desc", modified: "desc" };

  // Which criterion's direction sub-row is currently expanded in the sort panel
  let sortExpandedKey = null;

  // Manual sort order for list view — array of task IDs (active tasks only)
  let listManualOrder = [];

  // List view property display order — "name" marks title position; chips go before/after
  let listPropOrder = ["name", "urgency", "value", "area"];

  // Key of the settings prop row currently being dragged
  let settingsDragKey = null;

  // List view drag state
  let listDragTaskId = null;
  let listDragOverId = null;
  let listDropAbove  = false;

  // ID of the task just added (used to scroll + highlight after render)
  let justAddedId = null;

  // Which properties to show on board cards
  const DEFAULT_CARD_PROPS = { urgency: true, notes: true, value: false, area: false };
  let cardVisibleProps = { ...DEFAULT_CARD_PROPS };

  // Which properties to show on list rows (and in the inline new form)
  const DEFAULT_LIST_PROPS = { urgency: false, value: false, area: false };
  let listVisibleProps = { ...DEFAULT_LIST_PROPS };

  // Whether the toolbar icon group is collapsed
  let toolbarCollapsed = false;

  // Property display order and custom labels
  const DEFAULT_PROP_ORDER  = ["stage", "urgency", "value", "area", "modified"];
  const DEFAULT_PROP_LABELS = { stage: "Stage", urgency: "Urgency", value: "Value", area: "Area", modified: "Modified" };
  let detailPropOrder  = [...DEFAULT_PROP_ORDER];
  let propLabels       = { ...DEFAULT_PROP_LABELS };
  let propDragSrcIdx   = null; // index of property row being dragged
  let propsCollapsed   = false; // whether the properties section is collapsed
  let lastDeletedRowIndex = -1; // index of last deleted row in the list, for ←/→ navigation

  // Undo stack — in-memory only, cleared on page reload
  const UNDO_LIMIT = 30;
  let undoStack = []; // [{ type, ...payload }]

  /* ── Element references ────────────────────────────────────────────────────── */

  const el = {
    toggleInfoButton:   document.getElementById("toggleInfoButton"),
    infoDrawer:         document.getElementById("infoDrawer"),
    statsGrid:          document.getElementById("statsGrid"),
    storageStatus:      document.getElementById("storageStatus"),
    exportJsonButton:   document.getElementById("exportJsonButton"),
    exportMarkdownButton: document.getElementById("exportMarkdownButton"),
    resetButton:        document.getElementById("resetButton"),
    seedNotice:         document.getElementById("seedNotice"),
    storageKeyValue:    document.getElementById("storageKeyValue"),
    storageKeyEditor:   document.getElementById("storageKeyEditor"),
    storageKeyInput:    document.getElementById("storageKeyInput"),
    storageKeyChangeBtn: document.getElementById("storageKeyChangeBtn"),
    storageKeySaveBtn:  document.getElementById("storageKeySaveBtn"),
    storageKeyCancelBtn: document.getElementById("storageKeyCancelBtn"),

    listViewButton:     document.getElementById("listViewButton"),
    boardViewButton:    document.getElementById("boardViewButton"),
    listView:           document.getElementById("listView"),
    boardView:          document.getElementById("boardView"),

    searchToggle:       document.getElementById("searchToggle"),
    filterToggle:       document.getElementById("filterToggle"),
    sortToggle:         document.getElementById("sortToggle"),
    searchFilterBar:    document.getElementById("searchFilterBar"),
    barSearchSection:   document.getElementById("barSearchSection"),
    searchInput:        document.getElementById("searchInput"),
    filterWrap:         document.getElementById("filterWrap"),
    filterPanel:        document.getElementById("filterPanel"),
    sortWrap:           document.getElementById("sortWrap"),
    sortPanel:          document.getElementById("sortPanel"),
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

    // Card fields standalone button (merged into settings popover — kept for DOM ref only)
    cardFieldsBtn:      document.getElementById("cardFieldsBtn"),
    cardFieldsPopover:  document.getElementById("cardFieldsPopover"),

    // Settings popover
    settingsToggle:     document.getElementById("settingsToggle"),
    settingsPopover:    document.getElementById("settingsPopover"),

    // Toolbar collapse
    toolbarCollapseBtn: document.getElementById("toolbarCollapseBtn"),
    toolbarIconGroup:   document.getElementById("toolbarIconGroup"),

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
    voiceMicBtn:        document.getElementById("voiceMicBtn"),
    cancelEditButton:   document.getElementById("cancelEditButton"),

    // Shortcuts panel
    shortcutsFab:        document.getElementById("shortcutsFab"),
    shortcutsPanel:      document.getElementById("shortcutsPanel"),
    shortcutsPanelClose: document.getElementById("shortcutsPanelClose"),

    // Click-guard backdrop (shown while any toolbar panel is open)
    panelBackdrop:       document.getElementById("panelBackdrop"),

    // App menu — page-specific items only (toggle + reset handled by header.js)
    appMenuBtn:          document.getElementById("appMenuBtn"),
    appMenuDropdown:     document.getElementById("appMenuDropdown"),
    menuAppInfo:         document.getElementById("menuAppInfo"),
    menuExportJson:      document.getElementById("menuExportJson"),
    menuExportMarkdown:  document.getElementById("menuExportMarkdown"),
    menuResetSeed:       document.getElementById("menuResetSeed"),

    // Reset app modal (controlled by header.js)
    resetAppOverlay:     document.getElementById("resetAppOverlay"),

    // Multi-select action bar
    multiActionBar:    document.getElementById("multiActionBar"),
    multiActionCount:  document.getElementById("multiActionCount"),
    multiActionDelete: document.getElementById("multiActionDelete"),
    multiActionClear:  document.getElementById("multiActionClear")
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
    if (state.ui.listVisibleProps) listVisibleProps = Object.assign({}, DEFAULT_LIST_PROPS, state.ui.listVisibleProps);
    if (state.ui.activeFilter) activeFilter = state.ui.activeFilter;
    if (state.ui.toolbarCollapsed !== undefined) toolbarCollapsed = Boolean(state.ui.toolbarCollapsed);
    if (Array.isArray(state.ui.detailPropOrder)) detailPropOrder = state.ui.detailPropOrder;
    if (state.ui.propLabels) propLabels = Object.assign({}, DEFAULT_PROP_LABELS, state.ui.propLabels);
    if (state.ui.propsCollapsed !== undefined) propsCollapsed = Boolean(state.ui.propsCollapsed);
    if (state.ui.listSort) {
      // Backwards compat: old single-key values → criteria mode with that key first
      if (["urgency", "value", "modified"].includes(state.ui.listSort)) {
        listSort = "criteria";
        const k = state.ui.listSort;
        sortCriteriaOrder = [k, ...["urgency", "value", "modified"].filter(x => x !== k)];
      } else {
        listSort = state.ui.listSort;
      }
    }
    if (Array.isArray(state.ui.sortCriteriaOrder)) sortCriteriaOrder = state.ui.sortCriteriaOrder;
    if (state.ui.sortDirs) sortDirs = Object.assign({ urgency: "desc", value: "desc", modified: "desc" }, state.ui.sortDirs);
    if (Array.isArray(state.ui.listManualOrder)) listManualOrder = state.ui.listManualOrder;
    if (Array.isArray(state.ui.listPropOrder) && state.ui.listPropOrder.includes("name")) listPropOrder = state.ui.listPropOrder;

    // Re-register any custom lane keys saved in boardColumns so list view and
    // normalizeLane() can find them after a page reload.
    boardColumns.forEach(col => {
      col.lanes.forEach(laneKey => {
        if (!ALL_LANES.includes(laneKey))    ALL_LANES.push(laneKey);
        if (!ACTIVE_LANES.includes(laneKey)) ACTIVE_LANES.push(laneKey);
        if (!LANE_LABELS[laneKey])           LANE_LABELS[laneKey] = col.label;
      });
    });

    if (state.seedVersion !== tracker.seedVersion) {
      el.seedNotice.hidden = false;
      el.seedNotice.textContent = "Browser state is from an older seed. Reset if you want the latest baseline.";
    }

    el.storageStatus.textContent = "Self-contained: seed data in project-data.js + browser localStorage. No external database needed.";

    populateAreaSelect();
    populateLaneSelect();
    bindEvents();
    initLasso();
    render();
  }

  /* ── State persistence ──────────────────────────────────────────────────────── */

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      // Register custom lane keys from saved boardColumns BEFORE normalizing tasks,
      // so normalizeLane() preserves custom lane values instead of falling back to backlog.
      const savedCols = (parsed.ui && Array.isArray(parsed.ui.boardColumns))
        ? parsed.ui.boardColumns
        : [];
      savedCols.forEach(col => {
        (col.lanes || []).forEach(laneKey => {
          if (!ALL_LANES.includes(laneKey))    ALL_LANES.push(laneKey);
          if (!ACTIVE_LANES.includes(laneKey)) ACTIVE_LANES.push(laneKey);
          if (!LANE_LABELS[laneKey])           LANE_LABELS[laneKey] = col.label;
        });
      });
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
        listVisibleProps,
        activeFilter,
        toolbarCollapsed,
        detailPropOrder,
        propLabels,
        propsCollapsed,
        listSort,
        sortCriteriaOrder,
        sortDirs,
        listManualOrder,
        listPropOrder
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
    // App menu — Actions-page items (menu toggle handled by header.js)
    el.menuAppInfo.addEventListener("click",        () => { closeAppMenu(); toggleInfo(); });
    el.menuExportJson.addEventListener("click",     () => { closeAppMenu(); exportJson(); });
    el.menuExportMarkdown.addEventListener("click", () => { closeAppMenu(); exportMarkdown(); });
    el.menuResetSeed.addEventListener("click",      () => { closeAppMenu(); resetToSeed(); });

    // Info panel
    el.toggleInfoButton.addEventListener("click", toggleInfo);
    el.exportJsonButton.addEventListener("click", exportJson);
    el.exportMarkdownButton.addEventListener("click", exportMarkdown);
    el.resetButton.addEventListener("click", resetToSeed);

    // Storage key
    if (el.storageKeyValue) el.storageKeyValue.textContent = STORAGE_KEY;
    if (el.storageKeyChangeBtn) {
      el.storageKeyChangeBtn.addEventListener("click", function () {
        el.storageKeyInput.value = STORAGE_KEY;
        el.storageKeyEditor.hidden = false;
        el.storageKeyChangeBtn.hidden = true;
        el.storageKeyValue.hidden = true;
        el.storageKeyInput.focus();
        el.storageKeyInput.select();
      });
    }
    if (el.storageKeyCancelBtn) {
      el.storageKeyCancelBtn.addEventListener("click", function () {
        el.storageKeyEditor.hidden = true;
        el.storageKeyChangeBtn.hidden = false;
        el.storageKeyValue.hidden = false;
      });
    }
    if (el.storageKeySaveBtn) el.storageKeySaveBtn.addEventListener("click", saveStorageKey);
    if (el.storageKeyInput) {
      el.storageKeyInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") saveStorageKey();
        if (e.key === "Escape") el.storageKeyCancelBtn.click();
      });
    }

    // View tabs
    el.listViewButton.addEventListener("click", () => setView("list"));
    el.boardViewButton.addEventListener("click", () => setView("board"));

    // Search toggle (expands drawer left)
    el.searchToggle.addEventListener("click", () => toggleSearch());
    el.searchInput.addEventListener("input", render);

    // Filter panel (dropdown below)
    el.filterToggle.addEventListener("click", e => { e.stopPropagation(); toggleFilterPanel(); });
    el.filterPanel.addEventListener("click", e => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      writeState();
      syncFilterPanel();
      closeFilterPanel();
      render();
    });

    // Sort panel (dropdown below, list view only)
    el.sortToggle.addEventListener("click", e => { e.stopPropagation(); toggleSortPanel(); });
    el.sortPanel.addEventListener("click", e => {
      // Prevent document-level close handler from seeing this click.
      // renderSortPanel() replaces innerHTML so e.target becomes detached;
      // without stopPropagation the contains() check fails and closes the panel.
      e.stopPropagation();

      // Reset button
      if (e.target.closest("[data-sort-reset]")) {
        listSort = "manual";
        sortExpandedKey = null;
        writeState();
        renderSortPanel();
        attachSortCriteriaDrag();
        render();
        return;
      }
      // Manual order row
      if (e.target.closest("[data-sort-manual]")) {
        listSort = "manual";
        sortExpandedKey = null;
        writeState();
        renderSortPanel();
        attachSortCriteriaDrag();
        closeSortPanel();
        render();
        return;
      }
      // Direction expand/collapse toggle (the right-side button on a criteria row)
      const expandBtn = e.target.closest("[data-sort-expand]");
      if (expandBtn) {
        const key = expandBtn.dataset.sortExpand;
        sortExpandedKey = sortExpandedKey === key ? null : key;
        if (listSort !== "criteria") { listSort = "criteria"; }
        writeState();
        renderSortPanel();
        attachSortCriteriaDrag();
        return;
      }
      // Direction option (sub-row)
      const dirBtn = e.target.closest("[data-sort-dir]");
      if (dirBtn && dirBtn.dataset.sortFor) {
        sortDirs[dirBtn.dataset.sortFor] = dirBtn.dataset.sortDir;
        sortExpandedKey = null;
        listSort = "criteria";
        writeState();
        renderSortPanel();
        attachSortCriteriaDrag();
        render();
        return;
      }
      // Criteria row body click → activate criteria mode (keep panel open)
      const criteriaRow = e.target.closest("[data-sort-key]");
      if (criteriaRow && !e.target.closest("[data-sort-drag]")) {
        listSort = "criteria";
        sortExpandedKey = null;
        writeState();
        renderSortPanel();
        attachSortCriteriaDrag();
        render();
        return;
      }
    });

    // Create button
    el.openCreateButton.addEventListener("click", () => openTaskModal(null));

    // Hidden lists toggle (list view)
    el.hiddenListsToggle.addEventListener("click", toggleHiddenLists);

    // Task modal
    el.closeModalButton.addEventListener("click", closeTaskModal);
    el.cancelEditButton.addEventListener("click", closeTaskModal);
    el.taskModal.addEventListener("click", e => { if (e.target === el.taskModal) closeTaskModal(); });
    el.taskForm.addEventListener("submit", handleTaskSubmit);
    initVoiceInput();

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
      if (t) confirmDelete(() => { deleteTask(t.id); closeDetail(); });
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

    // Settings popover — dynamically rendered on open (both views)
    el.settingsToggle.addEventListener("click", e => {
      e.stopPropagation();
      const opening = el.settingsPopover.hidden; // true = we are about to open it
      if (opening) { closeFilterPanel(); closeSortPanel(); renderSettingsPopover(); }
      el.settingsPopover.hidden = !opening;
      el.settingsToggle.setAttribute("aria-expanded", String(opening));
      el.settingsToggle.classList.toggle("is-active", opening);
      updateBackdrop();
    });

    // Toolbar collapse toggle
    el.toolbarCollapseBtn.addEventListener("click", () => {
      toolbarCollapsed = !toolbarCollapsed;
      applyToolbarCollapse();
      writeState();
    });

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
      if (!el.settingsPopover.contains(e.target) && !el.settingsToggle.contains(e.target)) {
        closeSettingsPanel();
      }
      if (!el.filterPanel.contains(e.target) && !el.filterToggle.contains(e.target)) {
        closeFilterPanel();
      }
      if (!el.sortPanel.contains(e.target) && !el.sortToggle.contains(e.target)) {
        closeSortPanel();
      }
      if (!el.shortcutsPanel.hidden &&
          !el.shortcutsPanel.contains(e.target) &&
          !el.shortcutsFab.contains(e.target)) {
        closeShortcutsPanel();
      }
    });

    // Panel backdrop — closes all open panels and swallows the click so it
    // does not fall through to task rows / board cards underneath
    el.panelBackdrop.addEventListener("click", e => {
      e.stopPropagation();
      closeSettingsPanel();
      closeFilterPanel();
      closeSortPanel();
      closeShortcutsPanel();
    });

    // Shortcuts panel
    el.shortcutsFab.addEventListener("click", toggleShortcutsPanel);
    el.shortcutsPanelClose.addEventListener("click", closeShortcutsPanel);

    // Close shortcuts panel on click outside — use capture so stopPropagation
    // on list rows / board cards doesn't block this from firing
    document.addEventListener("click", e => {
      if (!el.shortcutsPanel.hidden &&
          !el.shortcutsPanel.contains(e.target) &&
          !el.shortcutsFab.contains(e.target)) {
        closeShortcutsPanel();
      }
    }, true);

    // Global keyboard shortcuts
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        // Delete confirm dialog (belt-and-suspenders alongside its own inner handler)
        const deleteOverlay = document.querySelector(".delete-confirm-overlay");
        if (deleteOverlay)              { deleteOverlay.remove(); return; }
        // Modals
        if (!el.shortcutsPanel.hidden) { closeShortcutsPanel(); return; }
        if (!el.taskModal.hidden)      { closeTaskModal(); return; }
        if (!el.renameModal.hidden)    { closeRenameModal(); return; }
        if (!el.addColModal.hidden)    { closeAddColModal(); return; }
        if (!el.detailOverlay.hidden)  { closeDetail(); return; }
        // App menu
        if (el.appMenuDropdown && !el.appMenuDropdown.hidden) { closeAppMenu(); return; }
        // Toolbar popovers and panels
        if (!el.filterPanel.hidden)    { closeFilterPanel(); return; }
        if (!el.sortPanel.hidden)      { closeSortPanel(); return; }
        if (!el.settingsPopover.hidden) { closeSettingsPanel(); return; }
        if (!el.cardFieldsPopover.hidden) {
          el.cardFieldsPopover.hidden = true;
          el.cardFieldsBtn.classList.remove("is-active");
          el.cardFieldsBtn.setAttribute("aria-expanded", "false");
          return;
        }
        if (!el.colMenu.hidden) { closeColMenu(); return; }
        // Search / bar drawer
        if (activeBarMode !== null) { setBarMode(activeBarMode); return; }
        // Multi-select — dissolve so the user sees what was selected fade out
        if (selectedTaskIds.size > 0) { dissolveSelection(); return; }
        // List row focus
        const focused = document.querySelector(".list-row.is-focused");
        if (focused) { focused.classList.remove("is-focused"); return; }
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "n") { e.preventDefault(); openTaskModal(null); return; }
      const tag = document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") { e.preventDefault(); performUndo(); return; }
      if (e.key === "n" || e.key === "N") { e.preventDefault(); openTaskModal(null); return; }
      if (e.key === "?")                  { e.preventDefault(); toggleShortcutsPanel(); return; }
      if (e.key === "/") { e.preventDefault(); toggleSearch(true); return; }
      if (e.shiftKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        window.scrollBy({ top: e.key === "ArrowDown" ? 120 : -120, behavior: "smooth" });
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); navigateListRows(e.key === "ArrowDown" ? 1 : -1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (activeView !== "list") return;
        if (!el.detailOverlay.hidden) return;
        if (document.querySelector(".delete-confirm-overlay")) return;
        e.preventDefault();
        selectAtDeletedPosition();
        return;
      }
      // Delete / Backspace — intuitive bulk-delete for lasso selections
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedTaskIds.size > 0) { e.preventDefault(); bulkDeleteSelected(); return; }
      }
      if ((e.key === "d" || e.key === "D") && e.shiftKey) {
        // Bulk delete when items are selected via lasso
        if (selectedTaskIds.size > 0) { e.preventDefault(); bulkDeleteSelected(); return; }
        if (!el.detailOverlay.hidden && detailTaskId) {
          e.preventDefault();
          const t = getTask(detailTaskId);
          if (t) {
            const rows = [...el.taskList.querySelectorAll(".list-row[data-task-id]")];
            lastDeletedRowIndex = rows.findIndex(r => r.dataset.taskId === t.id);
            confirmDelete(() => { deleteTask(t.id); closeDetail(); });
          }
          return;
        }
        const focused = document.querySelector(".list-row.is-focused");
        if (focused && focused.dataset.taskId) {
          e.preventDefault();
          const tid = focused.dataset.taskId;
          const rows = [...el.taskList.querySelectorAll(".list-row[data-task-id]")];
          lastDeletedRowIndex = rows.indexOf(focused);
          focused.classList.remove("is-focused");
          confirmDelete(() => deleteTask(tid));
        }
      }
      // View switching
      if (e.key === "l" || e.key === "L") { e.preventDefault(); setView("list"); return; }
      if (e.key === "b" || e.key === "B") { e.preventDefault(); setView("board"); return; }
    });
  }

  /* ── Multi-select / Lasso ────────────────────────────────────────────────── */

  // Instant clear — used programmatically (new lasso, after delete, view switch).
  function clearSelection() {
    selectedTaskIds.clear();
    document.querySelectorAll(".list-row.is-selected, .board-card.is-selected")
      .forEach(node => node.classList.remove("is-selected"));
    renderMultiActionBar();
  }

  // Animated dissolve — used when the user explicitly deselects (Esc, × button, click outside).
  // The action bar hides immediately; the visual highlight fades out on the cards.
  function dissolveSelection() {
    if (!selectedTaskIds.size) return;
    const nodes = [];
    selectedTaskIds.forEach(id => {
      document.querySelectorAll(`[data-task-id="${id}"]`).forEach(n => nodes.push(n));
    });
    selectedTaskIds.clear();
    renderMultiActionBar(); // hides bar immediately
    nodes.forEach(node => {
      node.classList.remove("is-selected");
      node.classList.add("is-dissolving");
      node.addEventListener("animationend", () => node.classList.remove("is-dissolving"), { once: true });
    });
  }

  function renderMultiActionBar() {
    const count = selectedTaskIds.size;
    el.multiActionBar.hidden = count === 0;
    if (count > 0) {
      el.multiActionCount.textContent = `${count} selected`;
    }
  }

  function toggleTaskSelection(taskId) {
    if (selectedTaskIds.has(taskId)) {
      selectedTaskIds.delete(taskId);
      document.querySelectorAll(`[data-task-id="${taskId}"]`)
        .forEach(node => node.classList.remove("is-selected"));
    } else {
      selectedTaskIds.add(taskId);
      document.querySelectorAll(`[data-task-id="${taskId}"]`)
        .forEach(node => node.classList.add("is-selected"));
    }
    renderMultiActionBar();
  }

  function bulkDeleteSelected() {
    if (!selectedTaskIds.size) return;
    const ids   = [...selectedTaskIds];
    const count = ids.length;

    const doDelete = () => {
      ids.forEach(id => {
        const idx = tasks.findIndex(t => t.id === id);
        if (idx === -1) return;
        pushUndo({ type: "delete", task: Object.assign({}, tasks[idx]), index: idx });
        tasks = tasks.filter(t => t.id !== id);
      });
      clearSelection();
      writeState();
      render();
      showUndoToast(`${count} task${count === 1 ? "" : "s"} deleted — Cmd/Ctrl+Z to undo`);
    };

    if (localStorage.getItem("lbm_skipDeleteConfirm") === "true") { doDelete(); return; }

    const overlay = document.createElement("div");
    overlay.className = "delete-confirm-overlay";
    overlay.innerHTML = `
      <div class="delete-confirm-dialog">
        <div class="delete-confirm-header">
          <p class="delete-confirm-title">Delete ${count} task${count === 1 ? "" : "s"}?</p>
          <p class="delete-confirm-sub">Press Cmd/Ctrl+Z to undo each one.</p>
        </div>
        <label class="delete-confirm-skip"><input type="checkbox" id="deleteSkipCheck"><span>Don't ask again</span></label>
        <div class="delete-confirm-actions">
          <button class="ghost" id="deleteCancelBtn">Cancel</button>
          <button class="danger" id="deleteConfirmBtn">Delete ${count}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const cancelBtn  = overlay.querySelector("#deleteCancelBtn");
    const confirmBtn = overlay.querySelector("#deleteConfirmBtn");
    const cleanup = () => overlay.remove();
    cancelBtn.onclick  = cleanup;
    confirmBtn.onclick = () => {
      if (overlay.querySelector("#deleteSkipCheck").checked) localStorage.setItem("lbm_skipDeleteConfirm", "true");
      cleanup();
      doDelete();
    };
    overlay.addEventListener("click", e => { if (e.target === overlay) cleanup(); });
    const escH = e => { if (e.key === "Escape") { cleanup(); document.removeEventListener("keydown", escH); } };
    document.addEventListener("keydown", escH);
    confirmBtn.focus();
  }

  function initLasso() {
    function getSelectableCards() {
      if (activeView === "list") {
        return [...el.taskList.querySelectorAll(".list-row[data-task-id]")];
      }
      return [...el.boardColumns.querySelectorAll(".board-card[data-task-id]")];
    }

    function rectsIntersect(a, bLeft, bTop, bRight, bBottom) {
      return !(a.right < bLeft || a.left > bRight || a.bottom < bTop || a.top > bBottom);
    }

    function updateFromLasso(x1, y1, x2, y2) {
      const left   = Math.min(x1, x2);
      const top    = Math.min(y1, y2);
      const right  = Math.max(x1, x2);
      const bottom = Math.max(y1, y2);

      if (lassoEl) {
        lassoEl.style.left   = left + "px";
        lassoEl.style.top    = top + "px";
        lassoEl.style.width  = (right - left) + "px";
        lassoEl.style.height = (bottom - top) + "px";
      }

      // Update which cards are intersected
      selectedTaskIds.clear();
      getSelectableCards().forEach(node => {
        const r = node.getBoundingClientRect();
        if (rectsIntersect(r, left, top, right, bottom)) {
          node.classList.add("is-selected");
          selectedTaskIds.add(node.dataset.taskId);
        } else {
          node.classList.remove("is-selected");
        }
      });
      renderMultiActionBar();
    }

    // Don't start a lasso if the mousedown lands on an interactive element or
    // a UI panel/overlay that should receive its own click events.
    function isInteractive(target) {
      return !!target.closest(
        ".list-row, .board-card, button, input, textarea, select, a, " +
        ".list-drag-handle, [contenteditable], .board-column-header, " +
        ".board-col-add-btn, .board-col-new-btn, .inline-new-form, " +
        ".col-drop-indicator, .site-header, #filterPanel, #sortPanel, " +
        "#settingsPopover, #shortcutsPanel, #taskModal, #renameModal, " +
        "#addColModal, .delete-confirm-overlay, #detailPanel, #colMenu, " +
        "#multiActionBar, .panel-backdrop, .board-hidden-groups, " +
        ".board-add-column, .completed-wrap, .lasso-rect"
      );
    }

    function onMouseDown(e) {
      if (e.button !== 0) return;
      if (isInteractive(e.target)) return;
      if (!el.detailOverlay.hidden) return;
      if (document.querySelector(".delete-confirm-overlay")) return;
      if (!el.taskModal.hidden) return;
      if (!el.renameModal.hidden || !el.addColModal.hidden) return;

      // Only activate within the context of the currently active view.
      // This gives universal coverage (incl. empty space below/beside content)
      // while still ignoring clicks on the header, toolbar, etc.
      if (activeView === "list") {
        if (e.target.closest("#boardView")) return;
        // Must be in the page content area (not header/toolbar)
        if (!e.target.closest("#listView, .page-wrap")) return;
      } else if (activeView === "board") {
        if (!e.target.closest("#boardView")) return;
      } else {
        return;
      }

      e.preventDefault();
      lassoActive = true;
      lassoStart  = { x: e.clientX, y: e.clientY };
      let lassoMoved = false; // true once the mouse actually drags (not just clicks)

      lassoEl = document.createElement("div");
      lassoEl.className = "lasso-rect";
      lassoEl.style.left = e.clientX + "px";
      lassoEl.style.top  = e.clientY + "px";
      lassoEl.style.width  = "0";
      lassoEl.style.height = "0";
      document.body.appendChild(lassoEl);

      const onMove = ev => {
        if (!lassoActive) return;
        if (!lassoMoved) {
          lassoMoved = true;
          clearSelection(); // clear existing selection only when a real lasso drag starts
        }
        updateFromLasso(lassoStart.x, lassoStart.y, ev.clientX, ev.clientY);
      };

      const onUp = () => {
        lassoActive = false;
        if (lassoEl) { lassoEl.remove(); lassoEl = null; }
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup",   onUp);
        // A click without dragging = click outside — dissolve the selection slowly
        if (!lassoMoved) dissolveSelection();
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup",   onUp);
    }

    // Listen at document level so the lasso fires even when clicking below/beside
    // the content area (e.g. empty space beneath a short task list).
    document.addEventListener("mousedown", onMouseDown);

    // Wire up the action bar buttons
    el.multiActionDelete.addEventListener("click", bulkDeleteSelected);
    el.multiActionClear.addEventListener("click",  dissolveSelection);
  }

  /* ── List keyboard navigation ───────────────────────────────────────────────── */

  function navigateListRows(direction) {
    if (activeView !== "list") return;
    const rows = [...el.taskList.querySelectorAll(".list-row[data-task-id]")];
    if (!rows.length) return;

    const focused = document.querySelector(".list-row.is-focused");
    let nextIdx;

    if (!focused) {
      nextIdx = direction === 1 ? 0 : rows.length - 1;
    } else {
      const curr = rows.indexOf(focused);
      nextIdx = curr + direction;
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx >= rows.length) nextIdx = rows.length - 1;
      focused.classList.remove("is-focused");
    }

    const next = rows[nextIdx];
    next.classList.add("is-focused");
    scrollRowIntoView(next);

    // Enter opens the detail panel for the focused row
    const handleEnter = e => {
      if (e.key === "Enter") {
        e.preventDefault();
        document.removeEventListener("keydown", handleEnter);
        next.classList.remove("is-focused");
        openDetail(next.dataset.taskId);
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Escape") {
        document.removeEventListener("keydown", handleEnter);
        if (e.key === "Escape") next.classList.remove("is-focused");
      }
    };
    document.addEventListener("keydown", handleEnter);
  }

  /* ── Jump to last-deleted position ─────────────────────────────────────────── */

  function selectAtDeletedPosition() {
    if (activeView !== "list" || lastDeletedRowIndex < 0) return;
    const rows = [...el.taskList.querySelectorAll(".list-row[data-task-id]")];
    if (!rows.length) return;
    const idx = Math.min(lastDeletedRowIndex, rows.length - 1);
    const row = rows[idx];
    document.querySelectorAll(".list-row.is-focused").forEach(r => r.classList.remove("is-focused"));
    row.classList.add("is-focused");
    scrollRowIntoView(row);
  }

  /* ── Views ──────────────────────────────────────────────────────────────────── */

  function setView(view) {
    activeView = view;
    clearSelection();
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
    // Card fields standalone button is merged into settings — always hidden
    el.cardFieldsBtn.hidden = true;
    // Sync filter and sort panels (visible in both views)
    syncFilterPanel();
    syncSortPanel();
    // Apply toolbar collapse state
    applyToolbarCollapse();
  }

  function applyToolbarCollapse() {
    el.toolbarIconGroup.classList.toggle("is-collapsed", toolbarCollapsed);
    el.toolbarCollapseBtn.setAttribute("aria-expanded", String(!toolbarCollapsed));
    el.toolbarCollapseBtn.title = toolbarCollapsed ? "Show toolbar options" : "Hide toolbar options";
    // Close any open panel when collapsing
    if (toolbarCollapsed) {
      setBarMode(null);
      closeFilterPanel();
      closeSortPanel();
      el.settingsPopover.hidden = true;
      el.settingsToggle.classList.remove("is-active");
    }
  }

  /* ── Search / filter / sort bar ─────────────────────────────────────────────── */

  /* ── Search bar (drawer that expands left) ─────────────────────────────────── */

  function setBarMode(mode) {
    activeBarMode = (activeBarMode === mode) ? null : mode;
    const open = activeBarMode === "search";
    el.searchFilterBar.classList.toggle("is-open", open);
    el.barSearchSection.hidden = !open;
    el.searchToggle.classList.toggle("is-active", open);
    el.searchToggle.setAttribute("aria-expanded", String(open));
    if (open) el.searchInput.focus();
  }

  function toggleSearch(forceOpen) {
    if (forceOpen === true && activeBarMode !== "search") { setBarMode("search"); return; }
    setBarMode("search");
  }

  /* ── Filter panel (dropdown below icon) ─────────────────────────────────────── */

  /* Shows the backdrop and disables task-content pointer events whenever any
     toolbar panel / shortcuts panel is open. Must be called after any open/close change. */
  function updateBackdrop() {
    const anyOpen = !el.settingsPopover.hidden || !el.filterPanel.hidden ||
                    !el.sortPanel.hidden       || !el.shortcutsPanel.hidden;
    el.panelBackdrop.hidden = !anyOpen;
    // Block accidental task clicks via pointer-events instead of z-index layering
    el.listView.classList.toggle("panels-open", anyOpen);
    el.boardView.classList.toggle("panels-open", anyOpen);
  }

  function closeSettingsPanel() {
    el.settingsPopover.hidden = true;
    el.settingsToggle.classList.remove("is-active");
    el.settingsToggle.setAttribute("aria-expanded", "false");
    updateBackdrop();
  }

  function toggleFilterPanel() {
    const opening = el.filterPanel.hidden;
    if (opening) { closeSortPanel(); closeSettingsPanel(); syncFilterPanel(); }
    el.filterPanel.hidden = !opening;
    el.filterToggle.classList.toggle("is-active", opening);
    el.filterToggle.setAttribute("aria-expanded", String(opening));
    updateBackdrop();
  }

  function closeFilterPanel() {
    el.filterPanel.hidden = true;
    el.filterToggle.classList.remove("is-active");
    el.filterToggle.setAttribute("aria-expanded", "false");
    updateBackdrop();
  }

  function syncFilterPanel() {
    el.filterPanel.querySelectorAll("[data-filter]").forEach(btn => {
      const active = btn.dataset.filter === activeFilter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", String(active));
    });
    // Show active indicator on the icon when filter is non-default
    el.filterToggle.classList.toggle("has-value", activeFilter !== "all");
  }

  /* ── Sort panel (dropdown below icon, list view only) ───────────────────────── */

  function toggleSortPanel() {
    const opening = el.sortPanel.hidden;
    if (opening) { closeFilterPanel(); closeSettingsPanel(); syncSortPanel(); }
    el.sortPanel.hidden = !opening;
    el.sortToggle.classList.toggle("is-active", opening);
    el.sortToggle.setAttribute("aria-expanded", String(opening));
    updateBackdrop();
  }

  function closeSortPanel() {
    el.sortPanel.hidden = true;
    el.sortToggle.classList.remove("is-active");
    el.sortToggle.setAttribute("aria-expanded", "false");
    updateBackdrop();
  }

  /* ── Shortcuts panel ────────────────────────────────────────────────────────── */

  function toggleShortcutsPanel() {
    el.shortcutsPanel.hidden ? openShortcutsPanel() : closeShortcutsPanel();
  }

  function openShortcutsPanel() {
    el.shortcutsPanel.hidden = false;
    el.shortcutsFab.classList.add("is-active");
    updateBackdrop();
  }

  function closeShortcutsPanel() {
    el.shortcutsPanel.hidden = true;
    el.shortcutsFab.classList.remove("is-active");
    updateBackdrop();
  }

  function syncSortPanel() {
    renderSortPanel();
    // attachSortCriteriaDrag reads #sortCriteriaList which exists after render
    attachSortCriteriaDrag();
  }

  function syncBarSortBtns() {
    // Only update the has-value dot; don't rebuild panel HTML while it could be open
    el.sortToggle.classList.toggle("has-value", listSort !== "manual");
  }

  function renderSortPanel() {
    const SORT_LABELS = {
      urgency:  propLabels.urgency  || "Urgency",
      value:    propLabels.value    || "Dollar Value",
      modified: propLabels.modified || "Modified"
    };
    const DIR_LABELS = {
      urgency:  { desc: "High \u2192 Low", asc: "Low \u2192 High" },
      value:    { desc: "High \u2192 Low", asc: "Low \u2192 High" },
      modified: { desc: "Newest first",   asc: "Oldest first"    }
    };
    const chevronSvg = `<svg class="sort-dir-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
    const dragSvg    = `<svg class="sort-drag-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`;

    let html = `<div class="sort-panel-header">
      <span class="sort-panel-title">Sort by</span>
      <button class="sort-reset-btn" data-sort-reset title="Reset to manual order"${listSort === "manual" ? " disabled" : ""}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        Reset
      </button>
    </div>`;

    html += `<div class="sort-criteria-list" id="sortCriteriaList">`;
    sortCriteriaOrder.forEach((key, idx) => {
      const expanded = sortExpandedKey === key;
      const dir      = sortDirs[key] || "desc";
      const dirLabel = DIR_LABELS[key][dir];
      const criteriaActive = listSort === "criteria";
      html += `<div class="sort-criteria-row${criteriaActive ? " is-mode-active" : ""}" draggable="true" data-sort-key="${key}" data-sort-idx="${idx}">
        <span class="sort-drag-handle" data-sort-drag="${key}">${dragSvg}</span>
        <span class="sort-criteria-label">${SORT_LABELS[key]}</span>
        <button class="sort-dir-toggle${expanded ? " is-expanded" : ""}" data-sort-expand="${key}" title="Change direction">
          <span class="sort-dir-cur-label">${dirLabel}</span>
          ${chevronSvg}
        </button>
      </div>`;
      if (expanded) {
        html += `<div class="sort-dir-options" data-sort-options-for="${key}">
          <button class="sort-dir-option${dir === "desc" ? " is-active" : ""}" data-sort-dir="desc" data-sort-for="${key}">${DIR_LABELS[key].desc}</button>
          <button class="sort-dir-option${dir === "asc"  ? " is-active" : ""}" data-sort-dir="asc"  data-sort-for="${key}">${DIR_LABELS[key].asc}</button>
        </div>`;
      }
    });
    html += `</div>`;

    html += `<div class="sort-panel-sep"></div>`;
    html += `<button class="dropdown-item sort-manual-item${listSort === "manual" ? " is-active" : ""}" data-sort-manual role="menuitemradio" aria-checked="${listSort === "manual"}">Manual order</button>`;

    el.sortPanel.innerHTML = html;

    // Dot on the sort toggle when not in manual mode
    el.sortToggle.classList.toggle("has-value", listSort !== "manual");
  }

  function attachSortCriteriaDrag() {
    const list = document.getElementById("sortCriteriaList");
    if (!list) return;
    let dragKey  = null;
    let dragOver = null;

    list.addEventListener("dragstart", e => {
      const row = e.target.closest("[data-sort-key]");
      if (!row) { e.preventDefault(); return; }
      dragKey = row.dataset.sortKey;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => row.classList.add("is-dragging"), 0);
    });

    list.addEventListener("dragend", e => {
      list.querySelectorAll(".sort-criteria-row").forEach(r => {
        r.classList.remove("is-dragging", "drag-over-above", "drag-over-below");
      });
      dragKey  = null;
      dragOver = null;
    });

    list.addEventListener("dragover", e => {
      e.preventDefault();
      const row = e.target.closest("[data-sort-key]");
      if (!row || row.dataset.sortKey === dragKey) return;
      list.querySelectorAll(".sort-criteria-row").forEach(r => r.classList.remove("drag-over-above", "drag-over-below"));
      const rect  = row.getBoundingClientRect();
      const above = e.clientY < rect.top + rect.height / 2;
      row.classList.add(above ? "drag-over-above" : "drag-over-below");
      dragOver = { key: row.dataset.sortKey, above };
    });

    list.addEventListener("drop", e => {
      e.preventDefault();
      if (!dragKey || !dragOver) return;
      const fromIdx = sortCriteriaOrder.indexOf(dragKey);
      let   toIdx   = sortCriteriaOrder.indexOf(dragOver.key);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      sortCriteriaOrder.splice(fromIdx, 1);
      // Re-find target index after splice
      toIdx = sortCriteriaOrder.indexOf(dragOver.key);
      const insertAt = dragOver.above ? toIdx : toIdx + 1;
      sortCriteriaOrder.splice(insertAt, 0, dragKey);
      listSort = "criteria";
      sortExpandedKey = null;
      writeState();
      renderSortPanel();
      attachSortCriteriaDrag();
      render();
    });
  }

  /* ── Info panel ─────────────────────────────────────────────────────────────── */

  function saveStorageKey() {
    const raw = el.storageKeyInput.value.trim();
    // Allow letters, numbers, hyphens, underscores only
    const newKey = raw.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
    if (!newKey || newKey === STORAGE_KEY) {
      el.storageKeyCancelBtn.click();
      return;
    }
    // Migrate all data from old key to new key
    const oldData = localStorage.getItem(STORAGE_KEY);
    if (oldData) localStorage.setItem(newKey, oldData);
    localStorage.removeItem(STORAGE_KEY);
    // Migrate project name
    const oldNameKey = STORAGE_KEY + "-project-name";
    const oldName = localStorage.getItem(oldNameKey);
    if (oldName) localStorage.setItem(newKey + "-project-name", oldName);
    localStorage.removeItem(oldNameKey);
    // Persist the choice for this page path so it survives reloads
    try {
      localStorage.setItem("lbm-path-key:" + window.location.pathname, newKey);
    } catch (_) {}
    window.location.reload();
  }

  function toggleInfo() {
    const nextHidden = !el.infoDrawer.hidden;
    el.infoDrawer.hidden = nextHidden;
    el.toggleInfoButton.setAttribute("aria-expanded", String(!nextHidden));
    if (!nextHidden) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
    // Re-apply selection highlights after every DOM rebuild so the action bar
    // and visual selection stay in sync even after unrelated re-renders.
    reapplySelection();
  }

  // Re-stamp is-selected on freshly-built DOM nodes whose IDs are still selected.
  function reapplySelection() {
    if (!selectedTaskIds.size) return;
    selectedTaskIds.forEach(id => {
      document.querySelectorAll(`[data-task-id="${id}"]`)
        .forEach(node => node.classList.add("is-selected"));
    });
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

  function renderFilterSummary() {
    // Summary display removed — no-op
  }

  /* ── Filter logic ───────────────────────────────────────────────────────────── */

  function filteredTasks() {
    const search = el.searchInput ? el.searchInput.value.trim().toLowerCase() : "";
    const filter = activeFilter || "all";

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

    syncBarSortBtns();

    el.taskList.innerHTML = "";

    if (!active.length) {
      el.taskList.innerHTML = '<div class="empty-state-group"><div class="empty-state"><span class="empty-state-text">No active tasks. Press <kbd class="kbd-key">N</kbd> to add one.</span><button class="empty-state-btn" onclick="document.dispatchEvent(new KeyboardEvent(\'keydown\', {key:\'n\', bubbles:true}))">+ New Task</button></div><div class="empty-state empty-state--secondary"><span class="empty-state-text">New here? Find out more about the application <a href="docs.html" class="empty-state-link">here</a>.</span></div></div>';
    } else {
      active.forEach(t => el.taskList.appendChild(buildListRow(t, true)));
    }

    // Always render completed/archived at the bottom, after active tasks
    renderHiddenLists(filtered);
  }

  function buildListRow(task, enableDrag = false) {
    const row = document.createElement("article");
    row.className = "list-row" + (DONE_LANES.includes(task.lane) ? " is-done" : "");
    row.dataset.taskId = task.id;

    // Drag handle (active tasks only)
    if (enableDrag) {
      const handle = document.createElement("span");
      handle.className = "list-drag-handle";
      handle.title = "Drag to reorder";
      handle.innerHTML = `<svg width="10" height="14" viewBox="0 0 10 14" fill="none"><circle cx="3" cy="2" r="1.1" fill="currentColor"/><circle cx="7" cy="2" r="1.1" fill="currentColor"/><circle cx="3" cy="6" r="1.1" fill="currentColor"/><circle cx="7" cy="6" r="1.1" fill="currentColor"/><circle cx="3" cy="10" r="1.1" fill="currentColor"/><circle cx="7" cy="10" r="1.1" fill="currentColor"/></svg>`;
      row.appendChild(handle);

      row.draggable = true;

      row.addEventListener("dragstart", e => {
        if (e.target.closest(".list-tools")) { e.preventDefault(); return; }
        listDragTaskId = task.id;
        e.dataTransfer.effectAllowed = "move";

        // Multi-drag: if this row is part of the active selection, drag all selected
        // rows together, preserving their current visual order.
        if (selectedTaskIds.has(task.id) && selectedTaskIds.size > 1) {
          const allRows = [...el.taskList.querySelectorAll(".list-row[data-task-id]")];
          listDragMultiIds = allRows
            .map(r => r.dataset.taskId)
            .filter(id => selectedTaskIds.has(id));

          // Custom drag ghost showing the count
          const ghost = document.createElement("div");
          ghost.textContent = `${listDragMultiIds.length} tasks`;
          ghost.style.cssText =
            "position:fixed;top:-200px;left:-200px;" +
            "background:#8b5cf6;color:#f8f9fa;" +
            "padding:4px 10px;border-radius:6px;" +
            "font-size:12px;font-family:inherit;pointer-events:none;";
          document.body.appendChild(ghost);
          e.dataTransfer.setDragImage(ghost, 44, 14);
          setTimeout(() => ghost.remove(), 0);
        } else {
          listDragMultiIds = [];
        }

        setTimeout(() => {
          row.classList.add("is-dragging");
          // Dim all other selected rows to show they're moving together
          listDragMultiIds.forEach(id => {
            if (id === task.id) return;
            const r = el.taskList.querySelector(`[data-task-id="${id}"]`);
            if (r) r.classList.add("is-dragging");
          });
        }, 0);
      });

      row.addEventListener("dragend", () => {
        listDragTaskId = null;
        listDragOverId = null;
        row.classList.remove("is-dragging");
        // Un-dim any co-dragged rows
        listDragMultiIds.forEach(id => {
          const r = el.taskList.querySelector(`[data-task-id="${id}"]`);
          if (r) r.classList.remove("is-dragging");
        });
        listDragMultiIds = [];
        clearListDragIndicators();
      });

      row.addEventListener("dragover", e => {
        if (!listDragTaskId) return;
        // Skip if drop target is one of the items being dragged
        const dragIds = listDragMultiIds.length > 1 ? listDragMultiIds : [listDragTaskId];
        if (dragIds.includes(task.id)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const rect  = row.getBoundingClientRect();
        const above = e.clientY < rect.top + rect.height / 2;
        if (listDragOverId !== task.id || listDropAbove !== above) {
          clearListDragIndicators();
          listDragOverId = task.id;
          listDropAbove  = above;
          row.classList.add(above ? "drag-over-above" : "drag-over-below");
        }
      });

      row.addEventListener("dragleave", e => {
        if (!row.contains(e.relatedTarget)) {
          row.classList.remove("drag-over-above", "drag-over-below");
          if (listDragOverId === task.id) listDragOverId = null;
        }
      });

      row.addEventListener("drop", e => {
        if (!listDragTaskId) return;
        const dragIds = listDragMultiIds.length > 1 ? listDragMultiIds : [listDragTaskId];
        if (dragIds.includes(task.id)) return;
        e.preventDefault();
        row.classList.remove("drag-over-above", "drag-over-below");

        const rows         = [...el.taskList.querySelectorAll("[data-task-id]")];
        const currentOrder = rows.map(r => r.dataset.taskId);

        // Remove all dragged IDs from the order, then re-insert at the drop position
        const filtered = currentOrder.filter(id => !dragIds.includes(id));
        const targetIdx = filtered.indexOf(task.id);
        if (targetIdx === -1) return;

        const insertAt = listDropAbove ? targetIdx : targetIdx + 1;
        filtered.splice(insertAt, 0, ...dragIds);

        listManualOrder  = filtered;
        listSort         = "manual";
        listDragTaskId   = null;
        listDragOverId   = null;
        listDragMultiIds = [];
        writeState();
        render(); // reapplySelection() inside render re-stamps is-selected on rebuilt nodes
      });
    }

    // Urgency dot
    const dot = document.createElement("span");
    dot.className = `list-urgency u-${task.urgency}`;
    dot.title = `Urgency ${task.urgency} / 5`;

    // Content — built in listPropOrder sequence so chips appear above/below the title
    const content = document.createElement("div");
    content.className = "list-content";

    const title = document.createElement("h3");
    title.className = "list-title";
    title.textContent = task.title;

    // Click on title: inline edit; propagation stopped so row click doesn't fire
    title.addEventListener("click", e => {
      e.stopPropagation();
      if (content.querySelector(".list-title-input")) return; // already editing
      const input = document.createElement("input");
      input.type = "text";
      input.className = "list-title-input";
      input.value = task.title;
      const originalTitle = task.title;
      title.style.display = "none";
      content.insertBefore(input, title);
      input.focus();
      input.select();
      function commitTitle() {
        const v = input.value.trim();
        if (v && v !== originalTitle) {
          pushUndo({ type: "title-edit", taskId: task.id, fromTitle: originalTitle, toTitle: v });
          tasks = tasks.map(t => t.id === task.id ? { ...t, title: v, lastModified: today() } : t);
          task = getTask(task.id) || task;
          writeState();
          title.textContent = v;
        }
        input.remove();
        title.style.display = "";
      }
      function revertTitle() {
        input.remove();
        title.style.display = "";
      }
      input.addEventListener("blur", commitTitle);
      input.addEventListener("keydown", ke => {
        if (ke.key === "Enter") { ke.preventDefault(); input.blur(); }
        if (ke.key === "Escape") { ke.preventDefault(); input.removeEventListener("blur", commitTitle); revertTitle(); }
      });
    });

    // Build a chip element for a given prop key (returns null if disabled/empty)
    function buildPropChip(k) {
      if (k === "urgency" && listVisibleProps.urgency) {
        const c = document.createElement("span");
        c.className = `list-prop-chip list-prop-urgency u-chip-${task.urgency}`;
        c.textContent = `Urgency ${task.urgency}`;
        return c;
      }
      if (k === "value" && listVisibleProps.value && task.value) {
        const c = document.createElement("span");
        c.className = "list-prop-chip list-prop-value";
        c.textContent = `$${Number(task.value).toLocaleString()}`;
        return c;
      }
      if (k === "area" && listVisibleProps.area && task.area) {
        const c = document.createElement("span");
        c.className = "list-prop-chip list-prop-area";
        c.textContent = task.area.replace(/-/g, " ");
        return c;
      }
      return null;
    }

    // Chips before "name" → above title; chips after "name" → below title
    const nameIdx = listPropOrder.indexOf("name");
    const aboveChips = listPropOrder.slice(0, nameIdx).map(buildPropChip).filter(Boolean);
    const belowChips = listPropOrder.slice(nameIdx + 1).map(buildPropChip).filter(Boolean);

    if (aboveChips.length) {
      const row = document.createElement("div");
      row.className = "list-prop-row list-prop-row--above";
      aboveChips.forEach(c => row.appendChild(c));
      content.appendChild(row);
    }
    content.appendChild(title);
    if (belowChips.length) {
      const row = document.createElement("div");
      row.className = "list-prop-row";
      belowChips.forEach(c => row.appendChild(c));
      content.appendChild(row);
    }

    // Hover tools — single group on the right: delete | edit | done
    const tools = document.createElement("div");
    tools.className = "list-tools";

    const delBtn = makeIconBtn("Delete task", trashIcon(), e => {
      e.stopPropagation();
      confirmDelete(() => deleteTask(task.id));
    });
    delBtn.classList.add("icon-button--danger");
    tools.appendChild(delBtn);

    tools.appendChild(makeIconBtn("Open", pencilIcon(), e => {
      e.stopPropagation();
      openDetail(task.id);
    }));

    const doneBtn = document.createElement("button");
    doneBtn.className = "mark-done-btn";
    doneBtn.type = "button";
    doneBtn.textContent = DONE_LANES.includes(task.lane) ? "Move to backlog" : "✓ Done";
    doneBtn.addEventListener("click", e => {
      e.stopPropagation();
      const nextLane = DONE_LANES.includes(task.lane) ? "backlog" : "completed";
      moveTask(task.id, nextLane);
    });
    tools.appendChild(doneBtn);

    row.appendChild(dot);
    row.appendChild(content);
    row.appendChild(tools);

    // Click anywhere on row (except title) opens detail panel, or toggles selection
    row.addEventListener("click", () => {
      if (selectedTaskIds.size > 0) { toggleTaskSelection(task.id); return; }
      openDetail(task.id);
    });

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

  function clearListDragIndicators() {
    el.taskList.querySelectorAll(".drag-over-above, .drag-over-below").forEach(r => {
      r.classList.remove("drag-over-above", "drag-over-below");
    });
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
      // NOTE: do NOT call e.preventDefault() here — that cancels the card drag too
      if (e.target.closest(".board-card")) { return; }
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
    if (colTasks.length > 0) countEl.textContent = String(colTasks.length);

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
      empty.textContent = "Drop a card here or click + New item";
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
      e.stopPropagation(); // prevent bubbling to section (its dragstart calls preventDefault, cancelling this drag)
      e.dataTransfer.effectAllowed = "move";

      // Multi-drag: show a count ghost and dim all other selected cards
      if (selectedTaskIds.has(task.id) && selectedTaskIds.size > 1) {
        const ghost = document.createElement("div");
        ghost.textContent = `${selectedTaskIds.size} tasks`;
        ghost.style.cssText =
          "position:fixed;top:-200px;left:-200px;" +
          "background:#8b5cf6;color:#f8f9fa;" +
          "padding:4px 10px;border-radius:6px;" +
          "font-size:12px;font-family:inherit;pointer-events:none;";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 44, 14);
        setTimeout(() => ghost.remove(), 0);
      }

      setTimeout(() => {
        card.classList.add("is-dragging");
        if (selectedTaskIds.has(task.id)) {
          document.querySelectorAll(".board-card.is-selected").forEach(c => {
            if (c !== card) c.classList.add("is-dragging");
          });
        }
      }, 0);
    });
    card.addEventListener("dragend", () => {
      dragTaskId = null;
      card.classList.remove("is-dragging");
      // Un-dim any co-dragged selected cards
      document.querySelectorAll(".board-card.is-selected.is-dragging")
        .forEach(c => c.classList.remove("is-dragging"));
      clearCardDropIndicators();
      document.querySelectorAll(".board-column-body").forEach(b => b.classList.remove("drag-over"));
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
      confirmDelete(() => deleteTask(task.id));
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

    card.addEventListener("click", () => {
      if (selectedTaskIds.size > 0) { toggleTaskSelection(task.id); return; }
      openDetail(task.id);
    });

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

  function clearCardDropIndicators() {
    document.querySelectorAll(".board-card.card-drop-above, .board-card.card-drop-below")
      .forEach(c => c.classList.remove("card-drop-above", "card-drop-below"));
  }

  function bindDropZone(body) {
    body.addEventListener("dragover", e => {
      if (!dragTaskId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      body.classList.add("drag-over");

      // Compute insertion position among visible (non-dragging) cards
      const cards = [...body.querySelectorAll(".board-card:not(.is-dragging)")];
      clearCardDropIndicators();

      if (cards.length === 0) return;

      let targetCard = cards[cards.length - 1];
      let position   = "below";

      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
          targetCard = cards[i];
          position   = "above";
          break;
        }
      }

      targetCard.classList.add(position === "above" ? "card-drop-above" : "card-drop-below");
    });
    body.addEventListener("dragleave", e => {
      if (!body.contains(e.relatedTarget)) {
        body.classList.remove("drag-over");
        clearCardDropIndicators();
      }
    });
    body.addEventListener("drop", e => {
      e.preventDefault();
      body.classList.remove("drag-over");
      clearCardDropIndicators();
      if (!dragTaskId) return;
      const lane = body.dataset.dropLane;
      // Multi-drag: move all selected cards to the target lane together
      if (selectedTaskIds.has(dragTaskId) && selectedTaskIds.size > 1) {
        moveTasks([...selectedTaskIds], lane);
      } else {
        moveTask(dragTaskId, lane);
      }
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
      // Propagate renamed label to sort panel and settings popover
      syncSortPanel();
      if (!el.settingsPopover.hidden) renderSettingsPopover();
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
    pushUndo({ type: "title-edit", taskId: detailTaskId, fromTitle: t.title, toTitle: newTitle });
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

  /* ── Settings popover (dynamic, drag-to-reorder list props) ────────────────── */

  function renderSettingsPopover() {
    const pop = el.settingsPopover;
    pop.innerHTML = "";

    if (activeView === "list") {
      // ── List view: show draggable property order + visibility ──
      const h = document.createElement("div");
      h.className = "toolbar-dropdown-heading";
      h.textContent = "Properties";
      pop.appendChild(h);
      listPropOrder.forEach(key => pop.appendChild(buildSettingsPropRow(key)));
    } else {
      // ── Board view: show card field visibility ──
      const h = document.createElement("div");
      h.className = "toolbar-dropdown-heading";
      h.textContent = "Card fields";
      pop.appendChild(h);
      [
        ["urgency", propLabels.urgency || "Urgency", () => cardVisibleProps.urgency, v => { cardVisibleProps.urgency = v; }],
        ["notes",   "Notes preview",                () => cardVisibleProps.notes,   v => { cardVisibleProps.notes   = v; }],
        ["value",   propLabels.value   || "Value",  () => cardVisibleProps.value,   v => { cardVisibleProps.value   = v; }],
        ["area",    propLabels.area    || "Area",   () => cardVisibleProps.area,    v => { cardVisibleProps.area    = v; }],
      ].forEach(([, label, getVal, setVal]) => {
        const row = document.createElement("label");
        row.className = "toggle-item";
        const lbl = document.createElement("span"); lbl.className = "toggle-label"; lbl.textContent = label;
        const track = document.createElement("span");
        track.className = "toggle-track" + (getVal() ? " is-on" : "");
        track.setAttribute("role", "switch");
        track.setAttribute("aria-checked", String(!!getVal()));
        track.tabIndex = 0;
        track.innerHTML = '<span class="toggle-thumb"></span>';
        bindToggleSwitch(track, v => { setVal(v); writeState(); renderBoardView(filteredTasks()); });
        row.appendChild(lbl); row.appendChild(track);
        pop.appendChild(row);
      });
    }
  }

  function buildSettingsPropRow(key) {
    const row = document.createElement("div");
    row.className = "toggle-item settings-prop-row";
    row.dataset.propKey = key;
    row.draggable = true;

    const grip = document.createElement("span");
    grip.className = "settings-drag-grip";
    grip.innerHTML = `<svg width="9" height="12" viewBox="0 0 9 12" fill="none"><circle cx="2.5" cy="2" r="1" fill="currentColor"/><circle cx="6.5" cy="2" r="1" fill="currentColor"/><circle cx="2.5" cy="5.5" r="1" fill="currentColor"/><circle cx="6.5" cy="5.5" r="1" fill="currentColor"/><circle cx="2.5" cy="9" r="1" fill="currentColor"/><circle cx="6.5" cy="9" r="1" fill="currentColor"/></svg>`;
    row.appendChild(grip);

    const lbl = document.createElement("span");
    lbl.className = "toggle-label settings-prop-label";
    lbl.textContent = key === "name" ? "Name" : (propLabels[key] || key);
    row.appendChild(lbl);

    if (key === "name") {
      const lock = document.createElement("span");
      lock.className = "settings-lock-icon";
      lock.title = "Always visible";
      lock.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      row.appendChild(lock);
    } else {
      const track = document.createElement("span");
      track.className = "toggle-track" + (listVisibleProps[key] ? " is-on" : "");
      track.setAttribute("role", "switch");
      track.setAttribute("aria-checked", String(!!listVisibleProps[key]));
      track.tabIndex = 0;
      track.innerHTML = '<span class="toggle-thumb"></span>';
      bindToggleSwitch(track, v => { listVisibleProps[key] = v; writeState(); render(); });
      row.appendChild(track);
    }

    row.addEventListener("dragstart", e => {
      settingsDragKey = key;
      e.dataTransfer.setData("text/plain", key);
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => row.classList.add("settings-row-dragging"), 0);
    });

    row.addEventListener("dragend", () => {
      settingsDragKey = null;
      row.classList.remove("settings-row-dragging");
      clearSettingsDragIndicators();
    });

    row.addEventListener("dragover", e => {
      if (!settingsDragKey || settingsDragKey === key) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      clearSettingsDragIndicators();
      const rect = row.getBoundingClientRect();
      row.classList.add(e.clientY < rect.top + rect.height / 2 ? "settings-drop-above" : "settings-drop-below");
    });

    row.addEventListener("dragleave", e => {
      if (!row.contains(e.relatedTarget)) {
        row.classList.remove("settings-drop-above", "settings-drop-below");
      }
    });

    row.addEventListener("drop", e => {
      e.preventDefault();
      if (!settingsDragKey || settingsDragKey === key) return;
      const fromKey = settingsDragKey;
      clearSettingsDragIndicators();
      row.classList.remove("settings-drop-above", "settings-drop-below");
      const rect = row.getBoundingClientRect();
      const above = e.clientY < rect.top + rect.height / 2;
      const fromIdx = listPropOrder.indexOf(fromKey);
      if (fromIdx === -1 || !listPropOrder.includes(key)) return;
      const newOrder = listPropOrder.slice();
      const [moved] = newOrder.splice(fromIdx, 1);
      const newToIdx = newOrder.indexOf(key);
      newOrder.splice(above ? newToIdx : newToIdx + 1, 0, moved);
      listPropOrder = newOrder;
      settingsDragKey = null;
      writeState();
      render();
      renderSettingsPopover();
    });

    return row;
  }

  function clearSettingsDragIndicators() {
    el.settingsPopover.querySelectorAll(".settings-drop-above, .settings-drop-below")
      .forEach(r => r.classList.remove("settings-drop-above", "settings-drop-below"));
  }

  /* ── Toggle switch helpers ──────────────────────────────────────────────────── */

  // Wire up a <span role="switch"> toggle — calls onChange(newBoolValue) on click/Enter/Space
  function bindToggleSwitch(el, onChange) {
    function toggle() {
      const next = el.getAttribute("aria-checked") !== "true";
      el.setAttribute("aria-checked", String(next));
      el.classList.toggle("is-on", next);
      onChange(next);
    }
    el.addEventListener("click", toggle);
    el.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
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
    const existing = getTask(taskId);
    if (existing && existing.lane !== nextLane) {
      pushUndo({ type: "lane-change", taskId, fromLane: existing.lane, toLane: nextLane, taskTitle: existing.title });
    }
    tasks = tasks.map(t =>
      t.id === taskId ? Object.assign({}, t, { lane: nextLane, lastModified: today() }) : t
    );
    writeState();
    render();
    // Refresh detail panel if open
    if (detailTaskId === taskId) refreshDetailProps(getTask(taskId));
  }

  // Move multiple selected tasks to a lane at once (used by multi-drag on board).
  function moveTasks(taskIds, nextLane) {
    taskIds.forEach(id => {
      const existing = getTask(id);
      if (existing && existing.lane !== nextLane) {
        pushUndo({ type: "lane-change", taskId: id, fromLane: existing.lane, toLane: nextLane, taskTitle: existing.title });
      }
    });
    tasks = tasks.map(t =>
      taskIds.includes(t.id) ? Object.assign({}, t, { lane: nextLane, lastModified: today() }) : t
    );
    writeState();
    render(); // reapplySelection() inside render re-stamps is-selected on rebuilt nodes
    const count = taskIds.length;
    showUndoToast(`${count} task${count === 1 ? "" : "s"} moved — Cmd/Ctrl+Z to undo`);
  }

  function confirmDelete(onConfirm) {
    if (localStorage.getItem("lbm_skipDeleteConfirm") === "true") { onConfirm(); return; }
    const overlay = document.createElement("div");
    overlay.className = "delete-confirm-overlay";
    overlay.innerHTML = `
      <div class="delete-confirm-dialog">
        <div class="delete-confirm-header">
          <p class="delete-confirm-title">Delete this task?</p>
          <p class="delete-confirm-sub">Press Cmd/Ctrl+Z to undo.</p>
        </div>
        <label class="delete-confirm-skip"><input type="checkbox" id="deleteSkipCheck"><span>Don't ask again</span></label>
        <div class="delete-confirm-actions">
          <button class="ghost" id="deleteCancelBtn">Cancel</button>
          <button class="danger" id="deleteConfirmBtn">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const cancelBtn  = overlay.querySelector("#deleteCancelBtn");
    const confirmBtn = overlay.querySelector("#deleteConfirmBtn");
    const cleanup = () => overlay.remove();
    cancelBtn.onclick  = cleanup;
    confirmBtn.onclick = () => {
      if (overlay.querySelector("#deleteSkipCheck").checked) localStorage.setItem("lbm_skipDeleteConfirm", "true");
      cleanup();
      onConfirm();
    };
    overlay.addEventListener("click", e => { if (e.target === overlay) cleanup(); });
    overlay.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); cancelBtn.focus(); }
      if (e.key === "ArrowRight") { e.preventDefault(); confirmBtn.focus(); }
      // Stop Enter from bubbling to document-level handlers (e.g. list row open)
      if (e.key === "Enter") { e.stopPropagation(); }
    });
    const escH = e => { if (e.key === "Escape") { cleanup(); document.removeEventListener("keydown", escH); } };
    document.addEventListener("keydown", escH);
    confirmBtn.focus();
  }

  /* ── Undo system ────────────────────────────────────────────────────────────── */

  function pushUndo(entry) {
    undoStack.push(entry);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  }

  function performUndo() {
    if (!undoStack.length) return;
    const entry = undoStack.pop();

    if (entry.type === "delete") {
      const idx = Math.min(entry.index, tasks.length);
      tasks.splice(idx, 0, entry.task);
      writeState();
      render();
      showUndoToast(`Restored "${clip(entry.task.title)}"`);

    } else if (entry.type === "lane-change") {
      tasks = tasks.map(t =>
        t.id === entry.taskId ? Object.assign({}, t, { lane: entry.fromLane }) : t
      );
      writeState();
      render();
      if (detailTaskId === entry.taskId) refreshDetailProps(getTask(entry.taskId));
      const label = LANE_LABELS[entry.fromLane] || entry.fromLane;
      showUndoToast(`Moved "${clip(entry.taskTitle)}" back to ${label}`);

    } else if (entry.type === "title-edit") {
      tasks = tasks.map(t =>
        t.id === entry.taskId ? Object.assign({}, t, { title: entry.fromTitle }) : t
      );
      writeState();
      render();
      if (detailTaskId === entry.taskId) {
        const restored = getTask(entry.taskId);
        if (restored) el.detailTitle.textContent = restored.title;
      }
      showUndoToast(`Reverted title to "${clip(entry.fromTitle)}"`);
    }
  }

  function showUndoToast(message) {
    const existing = document.querySelector(".undo-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "undo-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add("is-visible")); });
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function clip(str, max = 42) {
    return str.length > max ? str.slice(0, max) + "…" : str;
  }

  function deleteTask(taskId) {
    const idx = tasks.findIndex(t => t.id === taskId);
    const deletedTask = idx !== -1 ? tasks[idx] : null;
    if (deletedTask) pushUndo({ type: "delete", task: Object.assign({}, deletedTask), index: idx });
    tasks = tasks.filter(t => t.id !== taskId);
    writeState();
    render();
    selectAtDeletedPosition();
    if (deletedTask) showUndoToast(`"${clip(deletedTask.title)}" deleted — Cmd/Ctrl+Z to undo`);
  }

  /* ── Task modal (create / edit) ─────────────────────────────────────────────── */

  function scrollRowIntoView(row) {
    const PADDING = 16; // extra breathing room above/below
    const header  = document.querySelector(".site-header");
    const stickyH = header ? header.getBoundingClientRect().height : 0;
    const topClear = stickyH + PADDING;

    const rect = row.getBoundingClientRect();
    const viewH = window.innerHeight;

    if (rect.top < topClear) {
      // Row is hidden behind the sticky header — scroll up to reveal it
      window.scrollBy({ top: rect.top - topClear, behavior: "smooth" });
    } else if (rect.bottom > viewH - PADDING) {
      // Row is clipped at the bottom — scroll down to reveal it
      window.scrollBy({ top: rect.bottom - viewH + PADDING, behavior: "smooth" });
    }
  }

  function highlightNewRow(id) {
    requestAnimationFrame(() => {
      const row = el.taskList.querySelector(`[data-task-id="${id}"]`);
      if (!row) return;
      scrollRowIntoView(row);
      row.classList.add("is-newly-added");
      row.addEventListener("animationend", () => row.classList.remove("is-newly-added"), { once: true });
    });
  }

  /* ── Inline new-item form (list view) ───────────────────────────────────────── */

  function openListInlineNew() {
    const existing = document.getElementById("list-inline-new");
    if (existing) { existing.remove(); return; } // toggle off

    // Remove empty-state placeholder so the form sits at top
    const empty = el.taskList.querySelector(".empty-state");
    if (empty) empty.remove();

    const form = document.createElement("div");
    form.className = "list-inline-new";
    form.id = "list-inline-new";

    // Invisible spacer matching the drag handle so dot + text align pixel-perfectly with saved rows
    // (rows have: handle 14px + margin-right -4px + gap 10px = 20px offset before dot)
    const handleSpacer = document.createElement("span");
    handleSpacer.style.cssText = "width:14px;flex-shrink:0;margin-right:-4px;";
    form.appendChild(handleSpacer);

    // Urgency dot — always shown, mirrors list-row layout
    const dot = document.createElement("span");
    dot.className = "list-urgency u-3";
    dot.title = "Urgency 3 — Medium";

    // Body: props above title (per listPropOrder), title input, props below title
    const body = document.createElement("div");
    body.className = "list-inline-new-body";

    // Only show inputs for properties enabled in settings
    let urgencySelect = null;
    let valueInput    = null;
    let areaSelect    = null;

    // Build a single prop input element by key; returns null if disabled/not applicable
    function buildInlineInput(key) {
      if (key === "urgency" && listVisibleProps.urgency) {
        urgencySelect = document.createElement("select");
        urgencySelect.className = "board-inline-new-select";
        [["1","1 — Low"],["2","2"],["3","3 — Medium"],["4","4 — High"],["5","5 — Critical"]].forEach(([v, t]) => {
          const opt = document.createElement("option");
          opt.value = v; opt.textContent = t;
          if (v === "3") opt.selected = true;
          urgencySelect.appendChild(opt);
        });
        urgencySelect.addEventListener("change", () => {
          dot.className = `list-urgency u-${urgencySelect.value}`;
          dot.title = `Urgency ${urgencySelect.value}`;
        });
        return urgencySelect;
      }
      if (key === "value" && listVisibleProps.value) {
        valueInput = document.createElement("input");
        valueInput.type = "number";
        valueInput.min = "0";
        valueInput.step = "100";
        valueInput.placeholder = "Value $";
        valueInput.className = "board-inline-new-select list-inline-new-value";
        return valueInput;
      }
      if (key === "area" && listVisibleProps.area) {
        areaSelect = document.createElement("select");
        areaSelect.className = "board-inline-new-select";
        tracker.areas.forEach(a => {
          const opt = document.createElement("option");
          opt.value = a; opt.textContent = a.replace(/-/g, " ");
          areaSelect.appendChild(opt);
        });
        return areaSelect;
      }
      return null;
    }

    // Mirror listPropOrder: props before "name" → above title, props after → below
    const nameIdx    = listPropOrder.indexOf("name");
    const beforeKeys = listPropOrder.slice(0, nameIdx);
    const afterKeys  = listPropOrder.slice(nameIdx + 1);

    const aboveInputs = beforeKeys.map(buildInlineInput).filter(Boolean);
    if (aboveInputs.length) {
      const propsDiv = document.createElement("div");
      propsDiv.className = "list-inline-new-props";
      aboveInputs.forEach(inp => propsDiv.appendChild(inp));
      body.appendChild(propsDiv);
    }

    const titleInput = document.createElement("div");
    titleInput.className = "list-inline-new-title";
    titleInput.contentEditable = "true";
    titleInput.dataset.placeholder = "Type the title…";
    body.appendChild(titleInput);

    const belowInputs = afterKeys.map(buildInlineInput).filter(Boolean);
    if (belowInputs.length) {
      const propsDiv = document.createElement("div");
      propsDiv.className = "list-inline-new-props";
      belowInputs.forEach(inp => propsDiv.appendChild(inp));
      body.appendChild(propsDiv);
    }

    // Unified hint-style actions
    const actions = document.createElement("div");
    actions.className = "list-inline-new-actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "list-inline-new-add";
    saveBtn.textContent = "↵ Add";

    const sep = document.createElement("span");
    sep.className = "list-inline-new-sep";
    sep.textContent = "·";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "list-inline-new-cancel-btn";
    cancelBtn.textContent = "Esc Cancel";

    actions.appendChild(saveBtn);
    actions.appendChild(sep);
    actions.appendChild(cancelBtn);

    form.appendChild(dot);
    form.appendChild(body);
    form.appendChild(actions);

    el.taskList.insertBefore(form, el.taskList.firstChild);
    titleInput.focus();

    function dismiss() {
      form.remove();
      document.removeEventListener("mousedown", outsideClickHandler);
      render();
    }

    function outsideClickHandler(e) {
      if (!form.contains(e.target)) dismiss();
    }

    setTimeout(() => document.addEventListener("mousedown", outsideClickHandler), 0);

    function save(keepOpen = false) {
      const title = titleInput.innerText.trim();
      if (!title) { titleInput.focus(); return; }
      const urgencyVal = urgencySelect ? clamp(Number(urgencySelect.value) || 3, 1, 5) : 3;
      const newTask = {
        id:            createId(),
        title,
        notes:         "",
        body:          "",
        lane:          "newly-added-or-updated",
        urgency:       urgencyVal,
        value:         valueInput ? (Number(valueInput.value) || 0) : 0,
        priority:      urgencyToPriority(urgencyVal),
        area:          areaSelect ? areaSelect.value : (tracker.areas[0] || "general"),
        source:        "user-requested",
        recommendedBy: "",
        references:    [],
        lastModified:  today()
      };
      tasks.unshift(newTask);
      const addedId = newTask.id;
      writeState();

      if (keepOpen) {
        // Save and stay: re-render the list so the new task appears,
        // then re-insert the form at the top and re-focus
        titleInput.textContent = "";
        render();
        el.taskList.insertBefore(form, el.taskList.firstChild);
        titleInput.focus();
        // Highlight the added row; if it moved away (filtered/sorted), scroll to it
        // briefly then scroll back so the user can keep typing.
        requestAnimationFrame(() => {
          const row = el.taskList.querySelector(`[data-task-id="${addedId}"]`);
          if (!row) return;
          row.classList.add("is-newly-added");
          row.addEventListener("animationend", () => row.classList.remove("is-newly-added"), { once: true });
          const formRect = form.getBoundingClientRect();
          const rowRect  = row.getBoundingClientRect();
          // Row moved away from the form — do scroll-to-item, then scroll back
          if (Math.abs(rowRect.top - formRect.bottom) > 80) {
            scrollRowIntoView(row);
            setTimeout(() => {
              const header  = document.querySelector(".site-header");
              const stickyH = header ? header.getBoundingClientRect().height : 0;
              const GAP     = 24; // breathing room above the form
              const targetY = form.getBoundingClientRect().top + window.scrollY - stickyH - GAP;
              window.scrollTo({ top: targetY, behavior: "smooth" });
              titleInput.focus();
            }, 900);
          }
        });
      } else {
        document.removeEventListener("mousedown", outsideClickHandler);
        form.remove();
        render();
        highlightNewRow(addedId);
      }
    }

    saveBtn.addEventListener("click", () => save(false));
    cancelBtn.addEventListener("click", dismiss);
    titleInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(true); }
      if (e.key === "Escape") { dismiss(); }
    });
  }

  function openTaskModal(task, defaultLane) {
    // In list view, new items use the inline form instead of the modal
    if (!task && activeView === "list") {
      openListInlineNew();
      return;
    }

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
    if (el.voiceMicBtn) el.voiceMicBtn.classList.remove("is-listening", "is-error");
  }

  /* ── Voice input (Web Speech API) ─────────────────────────────────────────── */

  function initVoiceInput() {
    const btn = el.voiceMicBtn;
    if (!btn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      btn.title    = "Voice input not supported in this browser";
      btn.disabled = true;
      btn.style.opacity = "0.3";
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang            = "en-US";
    rec.interimResults  = false;
    rec.maxAlternatives = 1;

    let listening = false;

    btn.addEventListener("click", function() {
      if (listening) { rec.stop(); return; }
      rec.start();
    });

    rec.onstart = function() {
      listening = true;
      btn.classList.add("is-listening");
      btn.setAttribute("aria-label", "Listening… click to stop");
    };

    rec.onresult = function(e) {
      const transcript = e.results[0][0].transcript.trim();
      el.taskTitle.value = transcript;
      el.taskTitle.focus();
      applyVoiceInference(transcript);
    };

    rec.onend = function() {
      listening = false;
      btn.classList.remove("is-listening");
      btn.setAttribute("aria-label", "Dictate title");
    };

    rec.onerror = function() {
      listening = false;
      btn.classList.remove("is-listening");
      btn.classList.add("is-error");
      setTimeout(function() { btn.classList.remove("is-error"); }, 1500);
      btn.setAttribute("aria-label", "Dictate title");
    };
  }

  function applyVoiceInference(text) {
    const lower = text.toLowerCase();

    const urgency =
      /\b(critical|blocker|blocking|urgent|asap|emergency)\b/.test(lower)                       ? 5 :
      /\b(high[ -]priority|important|soon|immediately)\b/.test(lower)                            ? 4 :
      /\b(when (i get to it|possible)|low[ -]priority|someday|eventually)\b/.test(lower)         ? 2 :
      /\b(low|minor|nice to have|optional)\b/.test(lower)                                        ? 1 : null;

    if (urgency !== null && el.taskUrgency) el.taskUrgency.value = String(urgency);

    const area =
      /\b(doc(s|ument(ation)?)|readme|guide|write.?up)\b/.test(lower)           ? "docs"           :
      /\b(security|auth(entication)?|permission|access|ssl|cert)\b/.test(lower)  ? "security"       :
      /\b(design|ui|ux|layout|style|css|color|font)\b/.test(lower)              ? "ui-ux"          :
      /\b(platform|infra(structure)?|deploy|server|build|ci|cd)\b/.test(lower)  ? "platform"       :
      /\b(release|version|ship|launch|publish)\b/.test(lower)                   ? "release"        :
      /\b(product|feature|workflow|user story)\b/.test(lower)                   ? "product"        : null;

    if (area !== null && el.taskArea) el.taskArea.value = area;
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
      justAddedId = nextTask.id;
    }

    const addedId = justAddedId;
    writeState();
    closeTaskModal();
    render();

    if (addedId) {
      highlightNewRow(addedId);
      justAddedId = null;
    }
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
    if (listSort === "manual") {
      const ai = listManualOrder.indexOf(a.id);
      const bi = listManualOrder.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    // Multi-level criteria sort — iterate in priority order.
    // Uses explicit comparisons (no sign arithmetic) to keep the logic unambiguous.
    // Array.sort: return -1 → a before b (a higher in list); return 1 → b before a.
    for (const key of sortCriteriaOrder) {
      const desc = (sortDirs[key] || "desc") !== "asc"; // true = High→Low / Newest first
      let aVal, bVal;
      if      (key === "urgency")  { aVal = a.urgency;                   bVal = b.urgency; }
      else if (key === "value")    { aVal = a.value;                     bVal = b.value; }
      else if (key === "modified") { aVal = String(a.lastModified || ""); bVal = String(b.lastModified || ""); }
      else continue;
      if (aVal === bVal) continue;            // tie → next criterion
      if (desc) return aVal > bVal ? -1 : 1; // High→Low: bigger aVal goes first (return -1)
      else      return aVal < bVal ? -1 : 1; // Low→High: smaller aVal goes first (return -1)
    }
    return 0;
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
    const lines = ["# LBM Tasks", "", `Exported: ${new Date().toISOString()}`, "", "## Tasks", ""];
    tasks.slice().sort(sortTasks).forEach(t => {
      lines.push(`- ${t.title} | ${LANE_LABELS[t.lane] || t.lane} | urgency ${t.urgency}`);
      if (t.notes) lines.push(`  Notes: ${t.notes}`);
      lines.push("");
    });
    download(`ltm-tasks-${dt}.md`, lines.join("\n"), "text/markdown");
  }

  function resetToSeed() {
    // Save snapshot before resetting so the undo banner can restore it
    var snapshot = localStorage.getItem(STORAGE_KEY);

    tasks         = tracker.tasks.map(normalizeTask);
    boardColumns  = DEFAULT_BOARD_COLUMNS.map(c => Object.assign({}, c));
    collapsedCols = [];
    hiddenExpanded = false;
    el.seedNotice.hidden = true;
    writeState();
    render();

    var menu = window._lbmAppMenu;
    if (menu && menu.createUndoBanner) {
      menu.createUndoBanner("Reset to seed data.", function () {
        if (snapshot) {
          localStorage.setItem(STORAGE_KEY, snapshot);
          location.reload();
        }
      });
    }
  }

  /* ── App menu helpers (toggle owned by header.js, these are convenience wrappers) */

  function closeAppMenu() {
    if (window._lbmAppMenu && window._lbmAppMenu.closeMenu) {
      window._lbmAppMenu.closeMenu();
      return;
    }
    if (el.appMenuDropdown) el.appMenuDropdown.hidden = true;
    if (el.appMenuBtn) {
      el.appMenuBtn.setAttribute("aria-expanded", "false");
      el.appMenuBtn.classList.remove("is-open");
    }
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

  /* ── Public API ─────────────────────────────────────────────────────────────── */

  window.LBM = {
    /**
     * Add a task from outside the app (e.g. Claude Code browser console).
     * All fields are optional except `title`. Returns the normalised task.
     *
     * Example:
     *   window.LBM.addTask({ title: "Fix auth bug", urgency: 5, area: "security", value: 10000 })
     */
    addTask: function(taskObj) {
      if (!taskObj || !taskObj.title) {
        console.error("[LBM] addTask: `title` is required.");
        return null;
      }
      const t = normalizeTask(Object.assign({
        id:           createId(),
        lane:         "newly-added-or-updated",
        lastModified: today()
      }, taskObj));
      tasks.unshift(t);
      justAddedId = t.id;
      writeState();
      render();
      const addedId = t.id;
      setTimeout(function() { highlightNewRow(addedId); justAddedId = null; }, 0);
      console.log("[LBM] Task added:", t.id, "—", t.title);
      return t;
    },

    /**
     * Return a snapshot of all current tasks (copies, not live references).
     */
    getTasks: function() {
      return tasks.map(function(t) { return Object.assign({}, t); });
    }
  };

})();
