/* ─────────────────────────────────────────────────────────────────────────────
   header.js — universal project title (loads on every page)
   Reads and writes the project name to localStorage so changes made on any
   page (Tasks, Docs, Resources) persist everywhere.
───────────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

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
        indicator.classList.remove("instant");
        place(activeIndex, false);
      });
    });

    // Record current before navigating away
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        sessionStorage.setItem(PREV_KEY, activeIndex);
      });
    });
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

  function init() {
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
