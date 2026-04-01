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

  function init() {
    var brandName = document.getElementById("brandName");
    if (!brandName) return;

    // Show saved name, or fall back to seed default
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
