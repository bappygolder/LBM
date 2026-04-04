/* ─────────────────────────────────────────────────────────────────────────────
   header.js — universal project title (loads on every page)
   Reads and writes the project name to localStorage so changes made on any
   page (Tasks, Docs, Resources) persist everywhere.
───────────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  // Resolve a path-specific custom storage key before task-app.js reads it.
  // This runs synchronously (defer scripts execute in order), so the patched
  // value is visible when task-app.js assigns: const STORAGE_KEY = tracker.storageKey
  try {
    var pd = window.MCCProjectData;
    if (pd && pd.tracker) {
      var customKey = localStorage.getItem("lbm-path-key:" + window.location.pathname);
      if (customKey) pd.tracker.storageKey = customKey;
    }
  } catch (_) {}

  function storageKey() {
    var pd = window.MCCProjectData;
    return ((pd && pd.tracker && pd.tracker.storageKey) || "ltm-task-tracker-v1") + "-project-name";
  }

  function defaultName() {
    var pd = window.MCCProjectData;
    return (pd && pd.project && pd.project.name) || "LBM";
  }

  // ── Tab indicator ─────────────────────────────────────────────────────────────
  function initTabIndicator() {
    var nav = document.querySelector("nav.tabs");
    if (!nav) return;

    var tabs = Array.prototype.slice.call(nav.querySelectorAll(".tab"));
    if (!tabs.length) return;

    var activeIndex = -1;
    tabs.forEach(function (tab, i) {
      if (tab.classList.contains("active")) activeIndex = i;
    });
    if (activeIndex === -1) return;

    var indicator = document.createElement("div");
    indicator.className = "tab-indicator instant";
    nav.insertBefore(indicator, nav.firstChild);

    function measure(index) {
      var tab = tabs[index];
      var navRect = nav.getBoundingClientRect();
      var tabRect = tab.getBoundingClientRect();
      return {
        left: tabRect.left - navRect.left,
        width: tabRect.width,
        height: tabRect.height
      };
    }

    function place(index, instant) {
      var m = measure(index);
      if (instant) indicator.classList.add("instant");
      else indicator.classList.remove("instant");
      indicator.style.left = m.left + "px";
      indicator.style.width = m.width + "px";
      indicator.style.height = m.height + "px";
    }

    var PREV_KEY = "lbm.tab.prev";
    var prevIndex = parseInt(sessionStorage.getItem(PREV_KEY) || "-1", 10);
    var startIndex = (prevIndex >= 0 && prevIndex < tabs.length) ? prevIndex : activeIndex;

    // Snap to previous tab position instantly
    place(startIndex, true);
    indicator.offsetHeight; // force reflow

    // Then slide to current tab
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        place(activeIndex, false);
      });
    });

    // Record current before navigating away
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        sessionStorage.setItem(PREV_KEY, activeIndex);
      });
    });

    // Expose indicator API for app menu to slide indicator to/from menu tab
    var menuIndex = -1;
    tabs.forEach(function (tab, i) {
      if (tab.classList.contains("tab-menu")) menuIndex = i;
    });
    if (menuIndex !== -1) {
      window._lbmTabIndicator = {
        slideToMenu:   function () { place(menuIndex, false); },
        slideToActive: function () { place(activeIndex, false); }
      };
    }
  }

  // ── Page transition (exit on tab click, enter via CSS animation) ─────────────
  function initPageTransitions() {
    var contentEl = document.querySelector(".page-wrap, .docs-page, .resources-wrap");
    if (!contentEl) return;

    document.querySelectorAll("a.tab").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (link.classList.contains("active")) return;
        e.preventDefault();
        var href = link.href;
        contentEl.classList.add("page-exiting");
        setTimeout(function () {
          window.location.href = href;
        }, 160);
      });
    });
  }

  // ── Theme color ───────────────────────────────────────────────────────────────

  var THEMES = [
    { id: "purple", label: "Purple", color: "#8b5cf6", glow: "rgba(139,92,246,0.4)",  hover: "#a78bfa", soft: "rgba(139,92,246,0.12)", tabGlow: "rgba(139,92,246,0.3)", bgGlow: "rgba(139,92,246,0.12)" },
    { id: "blue",   label: "Blue",   color: "#3b82f6", glow: "rgba(59,130,246,0.4)",  hover: "#60a5fa", soft: "rgba(59,130,246,0.12)", tabGlow: "rgba(59,130,246,0.3)",  bgGlow: "rgba(59,130,246,0.12)" },
    { id: "teal",   label: "Teal",   color: "#14b8a6", glow: "rgba(20,184,166,0.4)",  hover: "#2dd4bf", soft: "rgba(20,184,166,0.12)", tabGlow: "rgba(20,184,166,0.3)",  bgGlow: "rgba(20,184,166,0.12)" },
    { id: "green",  label: "Green",  color: "#22c55e", glow: "rgba(34,197,94,0.4)",   hover: "#4ade80", soft: "rgba(34,197,94,0.12)",  tabGlow: "rgba(34,197,94,0.3)",   bgGlow: "rgba(34,197,94,0.12)" },
    { id: "amber",  label: "Amber",  color: "#f59e0b", glow: "rgba(245,158,11,0.4)",  hover: "#fbbf24", soft: "rgba(245,158,11,0.12)", tabGlow: "rgba(245,158,11,0.3)",  bgGlow: "rgba(245,158,11,0.10)" },
    { id: "rose",   label: "Rose",   color: "#f43f5e", glow: "rgba(244,63,94,0.4)",   hover: "#fb7185", soft: "rgba(244,63,94,0.12)",  tabGlow: "rgba(244,63,94,0.3)",   bgGlow: "rgba(244,63,94,0.12)" },
  ];

  function themeStorageKey() {
    var dir = window.location.pathname.replace(/\/[^\/]*$/, "") || "/";
    return "lbm-theme:" + dir;
  }

  function applyTheme(themeId) {
    var t = null;
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === themeId) { t = THEMES[i]; break; }
    }
    if (!t) return;
    var root = document.documentElement;
    root.style.setProperty("--accent",          t.color);
    root.style.setProperty("--accent-glow",     t.glow);
    root.style.setProperty("--accent-hover",    t.hover);
    root.style.setProperty("--accent-soft",     t.soft);
    root.style.setProperty("--tab-active",      t.color);
    root.style.setProperty("--tab-active-glow", t.tabGlow);
    root.style.setProperty("--bg-glow-primary", t.bgGlow);
  }

  function initThemePicker(dropdown) {
    if (!dropdown) return;

    var savedTheme = localStorage.getItem(themeStorageKey()) || "purple";

    // Build the theme section HTML
    var section = document.createElement("div");
    section.className = "app-menu-theme-section";
    section.innerHTML =
      '<span class="app-menu-theme-label">Theme</span>' +
      '<div class="app-menu-theme-swatches" role="group" aria-label="Project theme color"></div>';

    var swatchRow = section.querySelector(".app-menu-theme-swatches");

    THEMES.forEach(function (t) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-swatch";
      btn.setAttribute("data-theme", t.id);
      btn.setAttribute("aria-label", t.label + " theme");
      btn.setAttribute("aria-pressed", t.id === savedTheme ? "true" : "false");
      btn.setAttribute("title", t.label);
      btn.style.background = t.color;
      // Checkmark icon
      btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        localStorage.setItem(themeStorageKey(), t.id);
        applyTheme(t.id);
        // Update aria-pressed on all swatches
        swatchRow.querySelectorAll(".theme-swatch").forEach(function (s) {
          s.setAttribute("aria-pressed", s.getAttribute("data-theme") === t.id ? "true" : "false");
        });
      });
      swatchRow.appendChild(btn);
    });

    var sep = document.createElement("div");
    sep.className = "app-menu-sep";
    sep.setAttribute("role", "separator");

    dropdown.insertBefore(sep, dropdown.firstChild);
    dropdown.insertBefore(section, dropdown.firstChild);
  }

  // ── App menu ──────────────────────────────────────────────────────────────────

  var RESET_BACKUP_KEY    = "lbm.reset.backup";
  var SKIP_RESET_CONF_KEY = "lbm_skipResetConfirm";

  // Creates and shows the persistent undo banner. Returns { dismiss }.
  // Exposed on window._lbmAppMenu so task-app.js can reuse it.
  function createUndoBanner(message, onUndo, onDismiss) {
    var existing = document.getElementById("resetUndoBanner");
    if (existing) existing.remove();

    var banner = document.createElement("div");
    banner.className = "reset-undo-banner";
    banner.id = "resetUndoBanner";
    banner.setAttribute("role", "alert");
    banner.innerHTML =
      '<span class="reset-undo-message">' + message + '</span>' +
      '<button class="reset-undo-btn" type="button">Undo</button>' +
      '<button class="reset-undo-dismiss" type="button" aria-label="Dismiss">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      "</button>";

    document.body.appendChild(banner);

    function dismiss() {
      banner.classList.remove("is-visible");
      banner.classList.add("is-hiding");
      setTimeout(function () { if (banner.parentNode) banner.remove(); }, 250);
      if (onDismiss) onDismiss();
    }

    banner.querySelector(".reset-undo-btn").addEventListener("click", function () {
      dismiss();
      onUndo();
    });
    banner.querySelector(".reset-undo-dismiss").addEventListener("click", dismiss);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add("is-visible");
      });
    });

    return { dismiss: dismiss };
  }

  function initAppMenu() {
    var btn               = document.getElementById("appMenuBtn");
    var dropdown          = document.getElementById("appMenuDropdown");
    var resetAppItem      = document.getElementById("menuResetApp");
    var seedInfoBtn       = document.getElementById("menuSeedInfoBtn");
    var seedInfoPanel     = document.getElementById("seedInfoPanel");
    var overlay           = document.getElementById("resetAppOverlay");
    var cancelBtn         = document.getElementById("resetAppCancelBtn");
    var confirmBtn        = document.getElementById("resetAppConfirmBtn");
    var confirmInput      = document.getElementById("resetConfirmInput");
    var advancedToggle    = document.getElementById("menuAdvancedToggle");
    var advancedPanel     = document.getElementById("advancedPanel");
    var skipResetToggle   = document.getElementById("skipResetToggle");

    if (!btn || !dropdown) return;

    initThemePicker(dropdown);

    // Arrow-key navigation inside the open menu (Up/Down/Home/End + Left/Right for swatches)
    dropdown.addEventListener("keydown", function (e) {
      var isVertical   = e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End";
      var isHorizontal = e.key === "ArrowLeft" || e.key === "ArrowRight";
      if (!isVertical && !isHorizontal) return;

      var onSwatch = document.activeElement && document.activeElement.classList.contains("theme-swatch");

      // Left / Right — only meaningful when focus is on a swatch
      if (isHorizontal) {
        if (!onSwatch) return;
        e.preventDefault();
        e.stopPropagation();
        var swatches = Array.prototype.slice.call(dropdown.querySelectorAll(".theme-swatch"));
        var si = swatches.indexOf(document.activeElement);
        si = e.key === "ArrowRight"
          ? (si < swatches.length - 1 ? si + 1 : 0)
          : (si > 0 ? si - 1 : swatches.length - 1);
        swatches[si].focus();
        return;
      }

      // Up / Down / Home / End — navigate menu items; if on a swatch treat as idx -1
      // so Down → first item, Up → last item (exits the swatch row naturally)
      e.preventDefault();
      e.stopPropagation();
      var items = Array.prototype.slice.call(
        dropdown.querySelectorAll(".app-menu-item, .app-toggle-switch[tabindex]")
      ).filter(function (item) {
        return !item.closest("[hidden]") && item.offsetParent !== null;
      });
      if (!items.length) return;
      var idx = onSwatch ? -1 : items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        idx = idx < items.length - 1 ? idx + 1 : 0;
      } else if (e.key === "ArrowUp") {
        idx = idx > 0 ? idx - 1 : items.length - 1;
      } else if (e.key === "Home") {
        idx = 0;
      } else if (e.key === "End") {
        idx = items.length - 1;
      }
      items[idx].focus();
    });

    var wrap = document.getElementById("appMenuWrap");

    function openMenu() {
      dropdown.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("is-open");
      if (wrap) wrap.classList.add("is-open");
      if (window._lbmTabIndicator) window._lbmTabIndicator.slideToMenu();
    }

    function closeMenu() {
      dropdown.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      btn.classList.remove("is-open");
      if (wrap) wrap.classList.remove("is-open");
      if (window._lbmTabIndicator) window._lbmTabIndicator.slideToActive();
      if (seedInfoPanel) seedInfoPanel.hidden = true;
      if (seedInfoBtn) { seedInfoBtn.setAttribute("aria-expanded", "false"); seedInfoBtn.classList.remove("is-active"); }
    }

    function openResetModal() {
      if (!overlay) return;
      // Reset toggles to defaults: entries on, name + settings off
      var toggleTasks    = document.getElementById("resetToggleTasks");
      var toggleName     = document.getElementById("resetToggleName");
      var toggleSettings = document.getElementById("resetToggleSettings");
      if (toggleTasks)    toggleTasks.setAttribute("aria-checked", "true");
      if (toggleName)     toggleName.setAttribute("aria-checked", "false");
      if (toggleSettings) toggleSettings.setAttribute("aria-checked", "false");
      // Re-enable confirm button (at least one toggle is on by default)
      if (confirmBtn) confirmBtn.disabled = false;
      overlay.hidden = false;
      if (confirmBtn) confirmBtn.focus();
    }

    function closeResetModal() {
      if (!overlay) return;
      overlay.hidden = true;
      btn.focus();
    }

    // Toggle switches inside the reset dialog
    function bindResetToggle(toggleId) {
      var el = document.getElementById(toggleId);
      if (!el) return;
      function toggle(e) {
        e.preventDefault();
        e.stopPropagation();
        var next = el.getAttribute("aria-checked") !== "true";
        el.setAttribute("aria-checked", String(next));
        // Disable confirm button when all toggles are off
        var toggleTasks    = document.getElementById("resetToggleTasks");
        var toggleName     = document.getElementById("resetToggleName");
        var toggleSettings = document.getElementById("resetToggleSettings");
        var anyOn = (toggleTasks    && toggleTasks.getAttribute("aria-checked")    === "true") ||
                    (toggleName     && toggleName.getAttribute("aria-checked")     === "true") ||
                    (toggleSettings && toggleSettings.getAttribute("aria-checked") === "true");
        if (confirmBtn) confirmBtn.disabled = !anyOn;
      }
      el.addEventListener("click", toggle);
      el.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") toggle(e);
      });
    }
    bindResetToggle("resetToggleTasks");
    bindResetToggle("resetToggleName");
    bindResetToggle("resetToggleSettings");

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (dropdown.hidden) openMenu(); else closeMenu();
    });

    if (seedInfoBtn && seedInfoPanel) {
      seedInfoBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = !seedInfoPanel.hidden;
        seedInfoPanel.hidden = isOpen;
        seedInfoBtn.setAttribute("aria-expanded", String(!isOpen));
        seedInfoBtn.classList.toggle("is-active", !isOpen);
      });
    }

    // ── Shared reset execution ──────────────────────────────────────────────────
    // opts: { clearTasks: bool, resetName: bool, resetSettings: bool }
    // Only touches keys that belong to THIS copy. Other LBM installations
    // (different path keys) are never read or written.
    function executeReset(opts) {
      var pd       = window.MCCProjectData;
      var appKey   = (pd && pd.tracker && pd.tracker.storageKey) || "ltm-task-tracker-v1";
      var pathname = window.location.pathname;

      // Keys that belong only to this copy
      var ownKeys = [
        appKey,
        appKey + "-project-name",
        "lbm-theme:" + pathname,
        "lbm-fresh-banner-seen:" + pathname
      ];

      // Back up only this copy's keys (never the whole localStorage)
      var backupData = {};
      ownKeys.forEach(function (k) {
        var v = localStorage.getItem(k);
        if (v !== null) backupData[k] = v;
      });
      localStorage.setItem(RESET_BACKUP_KEY, JSON.stringify(backupData));

      if (opts.clearTasks) {
        // Preserve UI state (view, sort) unless settings are also being reset
        var existingRaw = localStorage.getItem(appKey);
        var existingUi  = {};
        if (existingRaw && !opts.resetSettings) {
          try { existingUi = (JSON.parse(existingRaw).ui) || {}; } catch (_) {}
        }
        localStorage.setItem(appKey, JSON.stringify({
          seedVersion: (pd && pd.tracker && pd.tracker.seedVersion) || "1.0",
          tasks: [],
          ui: existingUi
        }));
      }

      if (opts.resetName) {
        localStorage.removeItem(appKey + "-project-name");
      }

      if (opts.resetSettings) {
        localStorage.removeItem("lbm-theme:" + pathname);
      }

      location.reload();
    }

    if (cancelBtn) cancelBtn.addEventListener("click", closeResetModal);
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeResetModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        var toggleTasks    = document.getElementById("resetToggleTasks");
        var toggleName     = document.getElementById("resetToggleName");
        var toggleSettings = document.getElementById("resetToggleSettings");
        executeReset({
          clearTasks:    !toggleTasks    || toggleTasks.getAttribute("aria-checked")    === "true",
          resetName:     toggleName     && toggleName.getAttribute("aria-checked")     === "true",
          resetSettings: toggleSettings && toggleSettings.getAttribute("aria-checked") === "true"
        });
      });
    }

    // ── Advanced section ────────────────────────────────────────────────────────
    if (advancedToggle && advancedPanel) {
      advancedToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = !advancedPanel.hidden;
        advancedPanel.hidden = isOpen;
        advancedToggle.setAttribute("aria-expanded", String(!isOpen));
      });
    }

    if (skipResetToggle) {
      // Reflect saved preference on load
      var skipEnabled = localStorage.getItem(SKIP_RESET_CONF_KEY) === "true";
      skipResetToggle.setAttribute("aria-checked", String(skipEnabled));

      function toggleSkipReset(e) {
        e.preventDefault();
        e.stopPropagation();
        var current = skipResetToggle.getAttribute("aria-checked") === "true";
        var next = !current;
        skipResetToggle.setAttribute("aria-checked", String(next));
        localStorage.setItem(SKIP_RESET_CONF_KEY, String(next));
      }
      skipResetToggle.addEventListener("click", toggleSkipReset);
      skipResetToggle.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") toggleSkipReset(e);
      });
    }

    if (resetAppItem) {
      resetAppItem.removeEventListener("click", resetAppItem._lbmHandler);
      resetAppItem._lbmHandler = function () {
        closeMenu();
        openResetModal();
      };
      resetAppItem.addEventListener("click", resetAppItem._lbmHandler);
    }

    // Close on outside click
    document.addEventListener("click", function (e) {
      if (!dropdown.hidden && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        closeMenu();
      }
    }, true);

    // Close on Escape — only on pages that don't have task-app.js
    // (task-app.js handles its own Escape chain and calls closeMenu itself)
    var isIndexPage = !!document.getElementById("taskList");
    if (!isIndexPage) {
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          if (overlay && !overlay.hidden) { closeResetModal(); return; }
          if (!dropdown.hidden) { closeMenu(); return; }
        }
      });
    }

    // Expose for task-app.js to call
    window._lbmAppMenu = {
      openResetModal:   openResetModal,
      closeResetModal:  closeResetModal,
      createUndoBanner: createUndoBanner,
      closeMenu:        closeMenu
    };
  }

  // ── Post-reset undo: runs on every page load, independent of menu DOM ────────
  function initResetUndo() {
    var backup = localStorage.getItem(RESET_BACKUP_KEY);
    if (!backup) return;

    var resetUndoKeyHandler;

    var doResetUndo = function () {
      try {
        var data = JSON.parse(backup);
        Object.keys(data).forEach(function (k) { localStorage.setItem(k, data[k]); });
      } catch (_) {}
      localStorage.removeItem(RESET_BACKUP_KEY);
      location.reload();
    };

    var cleanupResetUndo = function () {
      document.removeEventListener("keydown", resetUndoKeyHandler);
    };

    createUndoBanner(
      "App reset. Undo to restore your data.",
      function () { cleanupResetUndo(); doResetUndo(); },
      function () { cleanupResetUndo(); localStorage.removeItem(RESET_BACKUP_KEY); }
    );

    // Ctrl/Cmd+Z — fires first (before task-level undo) on any page
    resetUndoKeyHandler = function (e) {
      var tag = document.activeElement ? document.activeElement.tagName : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable)) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        e.stopImmediatePropagation();
        cleanupResetUndo();
        doResetUndo();
      }
    };
    document.addEventListener("keydown", resetUndoKeyHandler);
  }

  // ── Keyboard shortcuts panel (Docs + Resources pages) ────────────────────────
  function initShortcutsPanel() {
    // index.html — handled by task-app.js
    if (document.getElementById("taskList")) return;

    var fab      = document.getElementById("shortcutsFab");
    var panel    = document.getElementById("shortcutsPanel");
    var closeBtn = document.getElementById("shortcutsPanelClose");
    if (!fab || !panel || !closeBtn) return;

    function openPanel()   { panel.hidden = false; fab.classList.add("is-active"); }
    function closePanel()  { panel.hidden = true;  fab.classList.remove("is-active"); }
    function togglePanel() { panel.hidden ? openPanel() : closePanel(); }

    fab.addEventListener("click", togglePanel);
    closeBtn.addEventListener("click", closePanel);

    document.addEventListener("click", function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !fab.contains(e.target)) closePanel();
    }, true);

    document.addEventListener("keydown", function (e) {
      var tag = document.activeElement ? document.activeElement.tagName : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey) return;

      if (e.key === "?") {
        e.preventDefault();
        togglePanel();
        return;
      }
      if (e.key === "Escape" && !panel.hidden) {
        e.stopImmediatePropagation();
        closePanel();
      }
    });
  }

  // ── Tab navigation keyboard shortcuts ────────────────────────────────────────
  // A → Actions  |  D → Docs  |  R → Resources
  // L → List view  |  B → Board view  (navigate to Actions if not already there)
  // Works on every page. Simulates a tab click so page transitions fire normally.
  function initTabShortcuts() {
    var isIndexPage = !!document.getElementById("taskList");

    // Brief nudge shown when the user presses a nav key for the page/view they're already on.
    function showAlreadyHereNudge(label) {
      var nudge = document.getElementById("lbmAlreadyHereNudge");
      if (!nudge) {
        nudge = document.createElement("div");
        nudge.id = "lbmAlreadyHereNudge";
        nudge.className = "lbm-already-here-nudge";
        document.body.appendChild(nudge);
      }
      nudge.textContent = label;
      nudge.classList.remove("is-visible");
      clearTimeout(nudge._timer);
      void nudge.offsetWidth; // force reflow so re-animation fires
      nudge.classList.add("is-visible");
      nudge._timer = setTimeout(function () {
        nudge.classList.remove("is-visible");
      }, 1600);
    }
    // Expose for task-app.js (L/B view nudge)
    window._lbmAlreadyHereNudge = showAlreadyHereNudge;

    // Patch localStorage state.ui.view and navigate to Actions page
    function navigateToView(view) {
      try {
        var pd = window.MCCProjectData;
        var key = (pd && pd.tracker && pd.tracker.storageKey) || "lbm-local-task-tracker";
        var customKey = localStorage.getItem("lbm-path-key:" + window.location.pathname);
        if (customKey) key = customKey;
        var raw = localStorage.getItem(key);
        var state = raw ? JSON.parse(raw) : {};
        if (!state.ui) state.ui = {};
        state.ui.view = view;
        localStorage.setItem(key, JSON.stringify(state));
      } catch (_) {}
      var actionsTab = document.querySelector("nav.tabs a.tab[href=\"index.html\"]");
      if (actionsTab) { actionsTab.click(); return; }
      window.location.href = "index.html";
    }

    document.addEventListener("keydown", function (e) {
      var tag = document.activeElement ? document.activeElement.tagName : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey) return;

      // Menu shortcut — M toggles the app menu; focus first item when opened via keyboard
      if (!e.shiftKey && (e.key === "m" || e.key === "M")) {
        var menuBtn = document.getElementById("appMenuBtn");
        var menuDd = document.getElementById("appMenuDropdown");
        if (menuBtn) {
          e.preventDefault();
          var wasHidden = !menuDd || menuDd.hidden;
          menuBtn.click();
          if (wasHidden && menuDd && !menuDd.hidden) {
            setTimeout(function () {
              var firstItem = menuDd.querySelector(".app-menu-item");
              if (firstItem) firstItem.focus();
            }, 0);
          }
        }
        return;
      }

      // Tab shortcuts — show nudge if already on that page
      var href = null;
      var pageName = null;
      if (!e.shiftKey && (e.key === "a" || e.key === "A")) { href = "index.html"; pageName = "Actions"; }
      if (!e.shiftKey && (e.key === "d" || e.key === "D")) { href = "docs.html"; pageName = "Docs"; }
      if (!e.shiftKey && (e.key === "r" || e.key === "R")) { href = "resources.html"; pageName = "Resources"; }
      if (href) {
        var tabs = Array.prototype.slice.call(document.querySelectorAll("nav.tabs a.tab"));
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].getAttribute("href") === href) {
            e.preventDefault();
            if (tabs[i].classList.contains("active")) {
              showAlreadyHereNudge("You're already on " + pageName);
            } else {
              tabs[i].click();
            }
            return;
          }
        }
        return;
      }

      // View shortcuts — on non-index pages, patch stored view and navigate to Actions
      if (!e.shiftKey && (e.key === "l" || e.key === "L")) {
        if (!isIndexPage) { e.preventDefault(); navigateToView("list"); }
        return;
      }
      if (!e.shiftKey && (e.key === "b" || e.key === "B")) {
        if (!isIndexPage) { e.preventDefault(); navigateToView("board"); }
        return;
      }
    });
  }

  // ── New-copy setup modal ─────────────────────────────────────────────────────
  // Replaces the old amber banner. Shows a full-screen blocking modal when this
  // path has no custom storage key but the default key already has data (meaning
  // another copy of LBM has been used in this browser).
  // The user names this copy → a unique key is generated → Start Fresh isolates it.

  function slugifyName(name) {
    return (name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 40) || "my-project";
  }

  function suggestNameFromPath(pathname) {
    var parts = pathname.split("/").filter(function (p) { return p.length > 0; });
    // Get the folder segment (second-to-last part if last is index.html etc.)
    var segment = parts[parts.length - 1] || "";
    segment = segment.replace(/\.(html?|htm)$/i, "");
    if (!segment || segment === "index") {
      segment = parts[parts.length - 2] || "my-project";
    }
    // Convert slug to title-case words for the name input
    return segment
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function generateUniqueKey(slug) {
    // Append a short time-based suffix for uniqueness
    return slug + "-" + Date.now().toString(36).slice(-4);
  }

  // ── Case B: fresh-install data recovery modal ─────────────────────────────
  // Shown when an install-token mismatch is detected: a new copy of LBM has
  // been placed at the same browser path as an existing installation, so the
  // old browser data would silently reappear. The user can keep it, wipe it,
  // or import from a JSON backup instead.
  function showDataRecoveryModal(overlay, pd, currentKey, installToken) {
    var titleEl      = document.getElementById("newCopyTitle");
    var subtitleEl   = document.getElementById("newCopySubtitle");
    var setupSection = document.getElementById("newCopySetupSection");
    var recSection   = document.getElementById("newCopyRecoverySection");
    var metaEl       = document.getElementById("newCopyRecoveryMeta");
    var keepBtn      = document.getElementById("newCopyKeepBtn");
    var wipeBtn      = document.getElementById("newCopyWipeBtn");
    var importInput  = document.getElementById("newCopyImportInput");

    // Switch to recovery layout
    if (setupSection) setupSection.hidden = true;
    if (recSection)   recSection.hidden   = false;
    if (titleEl)      titleEl.textContent = "Saved data found";
    if (subtitleEl)   subtitleEl.textContent = "Your browser has data saved from a previous install at this location. What would you like to do?";

    // Fill in task count + last-saved date from localStorage
    if (metaEl) {
      try {
        var raw    = localStorage.getItem(currentKey);
        var parsed = raw ? JSON.parse(raw) : null;
        var count  = (parsed && Array.isArray(parsed.tasks)) ? parsed.tasks.length : 0;
        var saved  = parsed && parsed.savedAt ? new Date(parsed.savedAt).toLocaleDateString() : null;
        metaEl.textContent = count + " task" + (count === 1 ? "" : "s") + (saved ? " \u00B7 last saved " + saved : "");
      } catch (_) {
        metaEl.textContent = "";
      }
    }

    function ackToken() {
      try { localStorage.setItem("lbm-ack-token:" + currentKey, installToken); } catch (_) {}
    }

    // Keep: acknowledge token and dismiss — existing data is untouched
    if (keepBtn) {
      keepBtn.addEventListener("click", function () {
        ackToken();
        overlay.hidden = true;
      });
    }

    // Start fresh: show inline confirm, wipe only on final confirmation
    var recoveryActions = document.getElementById("newCopyRecoveryActions");
    var wipeConfirm     = document.getElementById("newCopyWipeConfirm");
    var wipeCancelBtn   = document.getElementById("newCopyWipeCancelBtn");
    var wipeConfirmBtn  = document.getElementById("newCopyWipeConfirmBtn");

    if (wipeBtn) {
      wipeBtn.addEventListener("click", function () {
        if (recoveryActions) recoveryActions.hidden = true;
        if (wipeConfirm)     wipeConfirm.hidden     = false;
      });
    }
    if (wipeCancelBtn) {
      wipeCancelBtn.addEventListener("click", function () {
        if (wipeConfirm)     wipeConfirm.hidden     = true;
        if (recoveryActions) recoveryActions.hidden  = false;
      });
    }
    if (wipeConfirmBtn) {
      wipeConfirmBtn.addEventListener("click", function () {
        try {
          localStorage.removeItem(currentKey);
          localStorage.removeItem(currentKey + "-snapshots");
          localStorage.removeItem(currentKey + "-project-name");
          // Write an empty state so seed tasks don't reload on the next page load
          localStorage.setItem(currentKey, JSON.stringify({
            seedVersion: (pd && pd.tracker && pd.tracker.seedVersion) || "1.0",
            tasks: [],
            ui: {},
            savedAt: new Date().toISOString()
          }));
        } catch (_) {}
        ackToken();
        location.reload();
      });
    }

    // Import: read a JSON backup, write it to localStorage, acknowledge, reload
    if (importInput) {
      importInput.addEventListener("change", function () {
        var file = importInput.files && importInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var parsed   = JSON.parse(e.target.result);
            var imported = Array.isArray(parsed.tasks) ? parsed.tasks : [];
            if (!imported.length) { alert("No tasks found in the selected file."); return; }
            localStorage.setItem(currentKey, JSON.stringify({
              seedVersion: (pd && pd.tracker && pd.tracker.seedVersion) || "1.0",
              tasks: imported,
              ui: {},
              savedAt: new Date().toISOString()
            }));
            ackToken();
            location.reload();
          } catch (_) {
            alert("Could not read the file. Make sure it\u2019s a valid LBM JSON export.");
          }
        };
        reader.readAsText(file);
      });
    }

    // Details toggle: expand/collapse saved data info
    var detailsToggle = document.getElementById("newCopyDetailsToggle");
    if (detailsToggle && metaEl) {
      detailsToggle.addEventListener("click", function () {
        var isHidden = metaEl.hidden;
        metaEl.hidden = !isHidden;
        detailsToggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
      });
    }

    overlay.hidden = false;
    if (keepBtn) keepBtn.focus();
  }

  function initNewCopyModal() {
    var overlay = document.getElementById("newCopyOverlay");
    if (!overlay) return;

    // Only show on the main app page
    if (!document.getElementById("toggleInfoButton")) return;

    var pathname     = window.location.pathname;
    var pd           = window.MCCProjectData;
    var currentKey   = (pd && pd.tracker && pd.tracker.storageKey) || "ltm-task-tracker-v1";
    var installToken = pd && pd.tracker && pd.tracker.installToken;

    // ── Case B: same path, fresh copy detected via install-token mismatch ──
    if (installToken) {
      var storedToken = localStorage.getItem("lbm-ack-token:" + currentKey);
      var hasData     = !!localStorage.getItem(currentKey);
      if (storedToken !== installToken && hasData) {
        showDataRecoveryModal(overlay, pd, currentKey, installToken);
        return;
      }
      // No existing data (clean install) — store token so future loads skip this check
      if (!storedToken && !hasData) {
        try { localStorage.setItem("lbm-ack-token:" + currentKey, installToken); } catch (_) {}
      }
    }

    // ── Case A: different-path install — data exists under the default key ──
    if (localStorage.getItem("lbm-path-key:" + pathname)) return;
    if (!localStorage.getItem(currentKey)) return;
    if (localStorage.getItem("lbm-new-copy-skip:" + pathname)) return;

    var nameInput = document.getElementById("newCopyNameInput");
    var keyInput  = document.getElementById("newCopyKeyInput");
    var startBtn  = document.getElementById("newCopyStartBtn");
    var skipBtn   = document.getElementById("newCopySkipBtn");
    var advToggle = document.getElementById("newCopyAdvancedToggle");
    var advPanel  = document.getElementById("newCopyAdvancedPanel");

    if (!nameInput || !keyInput || !startBtn || !skipBtn) return;

    // Pre-fill name and auto-generate key
    var suggestedName = suggestNameFromPath(pathname);
    nameInput.value   = suggestedName;
    keyInput.value    = generateUniqueKey(slugifyName(suggestedName));

    // Regenerate key live as user types the name
    nameInput.addEventListener("input", function () {
      var slug = slugifyName(nameInput.value.trim() || suggestedName);
      keyInput.value = generateUniqueKey(slug);
    });

    // Advanced toggle
    if (advToggle && advPanel) {
      advToggle.addEventListener("click", function () {
        var isOpen = !advPanel.hidden;
        advPanel.hidden = isOpen;
        advToggle.setAttribute("aria-expanded", String(!isOpen));
      });
    }

    // Sanitize key (same rules as saveStorageKey in task-app.js)
    function sanitizeKey(raw) {
      return (raw || "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "");
    }

    // Start Fresh: create isolated storage for this copy and reload
    startBtn.addEventListener("click", function () {
      var projectName = nameInput.value.trim() || suggestedName;
      var newKey = sanitizeKey(keyInput.value.trim());
      if (!newKey) newKey = generateUniqueKey(slugifyName(projectName));

      try {
        localStorage.setItem("lbm-path-key:" + pathname, newKey);
        localStorage.setItem(newKey + "-project-name", projectName);
        localStorage.setItem(newKey, JSON.stringify({
          seedVersion: (pd && pd.tracker && pd.tracker.seedVersion) || "1.0",
          tasks: [],
          ui: {}
        }));
      } catch (_) {}
      location.reload();
    });

    // Enter key submits
    nameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") startBtn.click();
    });
    keyInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") startBtn.click();
    });

    // Use existing data: record dismissal, close modal (user accepts shared key)
    skipBtn.addEventListener("click", function () {
      try { localStorage.setItem("lbm-new-copy-skip:" + pathname, "1"); } catch (_) {}
      overlay.hidden = true;
    });

    // Show the modal
    overlay.hidden = false;
    nameInput.focus();
    nameInput.select();
  }

  // ── Storage GC ────────────────────────────────────────────────────────────
  // Scans localStorage and classifies keys into orphaned families (no longer
  // referenced by any lbm-path-key:* entry and not the active key) and keys
  // that are safe to auto-prune silently (no real task data).

  // Known singleton/meta prefixes that are never storage-key roots themselves
  var META_PREFIXES = ["lbm-", "lbm.", "lbm_"];

  function looksLikeMetaKey(k) {
    for (var i = 0; i < META_PREFIXES.length; i++) {
      if (k.indexOf(META_PREFIXES[i]) === 0) return true;
    }
    return false;
  }

  function scanStorage() {
    var pd         = window.MCCProjectData;
    var activeKey  = (pd && pd.tracker && pd.tracker.storageKey) || "ltm-task-tracker-v1";
    var allKeys    = [];
    var safeToAutoPrune = [];

    try {
      for (var i = 0; i < localStorage.length; i++) {
        allKeys.push(localStorage.key(i));
      }
    } catch (_) { return { activeKey: activeKey, orphanedFamilies: [], safeToAutoPrune: [] }; }

    // Build pathKeyMap: lbm-path-key:{path} → storageKey value
    var pathKeyMap = {};
    var skipKeys   = [];
    allKeys.forEach(function (k) {
      if (k.indexOf("lbm-path-key:") === 0) {
        pathKeyMap[k.slice("lbm-path-key:".length)] = localStorage.getItem(k);
      }
      if (k.indexOf("lbm-new-copy-skip:") === 0) {
        skipKeys.push(k);
      }
    });

    // All storage keys that are currently "in use"
    var referencedKeys = { [activeKey]: true };
    Object.keys(pathKeyMap).forEach(function (path) {
      var val = pathKeyMap[path];
      if (val) referencedKeys[val] = true;
    });

    // Find storage-key candidates: non-meta keys that own a project-name or ack-token sub-key
    var candidates = {};
    allKeys.forEach(function (k) {
      if (!looksLikeMetaKey(k)) {
        candidates[k] = true; // bare key itself might be a root
      }
      // A key like "lbm-ack-token:{x}" reveals {x} as a root
      if (k.indexOf("lbm-ack-token:") === 0) {
        candidates[k.slice("lbm-ack-token:".length)] = true;
      }
      // A key like "{x}-project-name" reveals {x} as a root
      if (k.slice(-"-project-name".length) === "-project-name") {
        candidates[k.slice(0, k.length - "-project-name".length)] = true;
      }
      // A key like "{x}-snapshots" reveals {x} as a root
      if (k.slice(-"-snapshots".length) === "-snapshots") {
        candidates[k.slice(0, k.length - "-snapshots".length)] = true;
      }
    });

    // Orphaned families = candidates not in referencedKeys
    var orphanedFamilies = [];
    Object.keys(candidates).forEach(function (candidate) {
      if (referencedKeys[candidate]) return; // active — skip

      // Confirm it's a real storage-key root (has at least one sub-key or data)
      var hasProjectName = allKeys.indexOf(candidate + "-project-name") !== -1;
      var hasAckToken    = allKeys.indexOf("lbm-ack-token:" + candidate) !== -1;
      var hasSnapshots   = allKeys.indexOf(candidate + "-snapshots") !== -1;
      var hasRoot        = allKeys.indexOf(candidate) !== -1;
      if (!hasRoot && !hasProjectName && !hasAckToken && !hasSnapshots) return;

      // Parse task data
      var taskCount = 0;
      var bytesEstimate = 0;
      var raw = hasRoot ? localStorage.getItem(candidate) : null;
      if (raw) {
        bytesEstimate = raw.length;
        try {
          var parsed = JSON.parse(raw);
          taskCount = (parsed && Array.isArray(parsed.tasks)) ? parsed.tasks.length : 0;
        } catch (_) {}
      }

      var hasData = taskCount > 0;
      var name    = (hasProjectName ? localStorage.getItem(candidate + "-project-name") : null) || candidate;

      orphanedFamilies.push({ key: candidate, name: name, taskCount: taskCount, bytesEstimate: bytesEstimate, hasData: hasData });

      // Safe to auto-prune if no task data
      if (!hasData) {
        if (hasRoot)        safeToAutoPrune.push(candidate);
        if (hasProjectName) safeToAutoPrune.push(candidate + "-project-name");
        if (hasAckToken)    safeToAutoPrune.push("lbm-ack-token:" + candidate);
        if (hasSnapshots)   safeToAutoPrune.push(candidate + "-snapshots");
      }
    });

    // Orphaned skip-keys: lbm-new-copy-skip:{path} with no path-key for that path
    var currentPathname = window.location.pathname;
    skipKeys.forEach(function (k) {
      var path = k.slice("lbm-new-copy-skip:".length);
      if (path !== currentPathname && !pathKeyMap.hasOwnProperty(path)) {
        safeToAutoPrune.push(k);
      }
    });

    // Stale reset-backup: lbm.reset.backup older than 30 min or corrupt
    var backupRaw = localStorage.getItem("lbm.reset.backup");
    if (backupRaw) {
      var pruneBackup = false;
      try {
        var bp = JSON.parse(backupRaw);
        var savedAt = bp && bp.savedAt ? new Date(bp.savedAt).getTime() : 0;
        if (!savedAt || Date.now() - savedAt > 30 * 60 * 1000) pruneBackup = true;
      } catch (_) { pruneBackup = true; }
      if (pruneBackup) safeToAutoPrune.push("lbm.reset.backup");
    }

    return { activeKey: activeKey, orphanedFamilies: orphanedFamilies, safeToAutoPrune: safeToAutoPrune };
  }

  function autoPruneStorage(scanResult) {
    var removed = 0;
    (scanResult.safeToAutoPrune || []).forEach(function (k) {
      try { localStorage.removeItem(k); removed++; } catch (_) {}
    });
    return removed;
  }

  function init() {
    // Apply stored theme immediately so there's no flash of default color
    var storedTheme = localStorage.getItem(themeStorageKey());
    if (storedTheme) applyTheme(storedTheme);

    var brandName = document.getElementById("brandName");
    if (brandName) {
      brandName.textContent = localStorage.getItem(storageKey()) || defaultName();

      brandName.addEventListener("click", function () {
        if (brandName.contentEditable === "true") return;

        var original = brandName.textContent;
        brandName.contentEditable = "true";
        brandName.focus();

        function commit() {
          brandName.contentEditable = "false";
          var val = brandName.textContent.trim() || original;
          brandName.textContent = val;
          localStorage.setItem(storageKey(), val);
          brandName.removeEventListener("keydown", handleKey);
        }

        function handleKey(e) {
          if (e.key === "Enter") { e.preventDefault(); brandName.blur(); }
          if (e.key === "Escape") {
            brandName.removeEventListener("blur", commit);
            brandName.removeEventListener("keydown", handleKey);
            brandName.contentEditable = "false";
            brandName.textContent = original;
          }
        }

        brandName.addEventListener("blur", commit, { once: true });
        brandName.addEventListener("keydown", handleKey);
      });
    }

    initTabIndicator();
    initPageTransitions();
    initShortcutsPanel();
    initTabShortcuts();
    initResetUndo();
    initNewCopyModal();
    initAppMenu();

    // Storage GC: run after all key resolution is complete
    try {
      var _scanResult = scanStorage();
      var _pruned     = autoPruneStorage(_scanResult);
      if (_pruned > 0) _scanResult = scanStorage(); // re-scan for accurate badge count
      window._lbmStorageScan = { result: _scanResult, pruned: _pruned, rescan: scanStorage };

      // Badge: count of orphaned families that still have task data
      var _badgeCount = 0;
      _scanResult.orphanedFamilies.forEach(function (f) { if (f.hasData) _badgeCount++; });
      var badge = document.getElementById("storageAuditBadge");
      if (badge) { badge.textContent = _badgeCount; badge.hidden = _badgeCount === 0; }
    } catch (_) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
