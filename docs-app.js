(function () {
  const data = window.MCCProjectData || {
    project: {
      reviewedOn: new Date().toISOString().split('T')[0],
      maintainedBy: "Local User"
    },
    docs: [],
    skills: []
  };
  const previewContent = window.MCCDocContent || {};
  const docsReviewedOn = document.getElementById("docsReviewedOn");
  const docsMaintainedBy = document.getElementById("docsMaintainedBy");
  const docsNav = document.getElementById("docsNav");
  const skillsNav = document.getElementById("skillsNav");
  const viewerType = document.getElementById("viewerType");
  const viewerTitle = document.getElementById("viewerTitle");
  const viewerSummary = document.getElementById("viewerSummary");
  const openRawLink = document.getElementById("openRawLink");
  const docPreview = document.getElementById("docPreview");
  const viewerCustomActions = document.getElementById("viewerCustomActions");
  const customDocBanner = document.getElementById("customDocBanner");
  const editDocBtn = document.getElementById("editDocBtn");
  const downloadDocBtn = document.getElementById("downloadDocBtn");
  const deleteDocBtn = document.getElementById("deleteDocBtn");

  const CUSTOM_DOCS_KEY = "lbm.custom.docs";

  docsReviewedOn.textContent = "Reviewed " + data.project.reviewedOn;
  docsMaintainedBy.textContent = "Seeded by " + data.project.maintainedBy;

  // ── Custom doc storage helpers ───────────────────────────────────────────────

  function loadStoredCustomDocs() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_DOCS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredCustomDocs(list) {
    localStorage.setItem(CUSTOM_DOCS_KEY, JSON.stringify(list));
  }

  // ── Build doc/skill arrays (seed + custom) ───────────────────────────────────

  const docItems = data.docs.map(function (item) {
    return Object.assign({ group: "Document" }, item);
  });
  const skillItems = data.skills.map(function (item) {
    return Object.assign({ group: "Skill" }, item);
  });

  // Load custom docs from localStorage and append to appropriate list
  var customDocs = loadStoredCustomDocs();
  customDocs.forEach(function (item) {
    var target = item.section === "skills" ? skillItems : docItems;
    target.push(Object.assign({ group: item.section === "skills" ? "Skill" : "Document", isCustom: true }, item));
  });

  renderNav(docsNav, docItems);
  renderNav(skillsNav, skillItems);
  if (docItems.length) {
    openItem(docItems[0]);
  }

  // ── Nav rendering ────────────────────────────────────────────────────────────

  function renderNav(container, items) {
    container.innerHTML = "";
    items.forEach(function (item) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nav-item" + (item.isCustom ? " nav-item--custom" : "");
      button.title = item.title + (item.summary ? " — " + item.summary : "");
      button.textContent = item.title;
      button.addEventListener("click", function () {
        openItem(item);
      });
      container.appendChild(button);
      item._button = button;
    });
  }

  // ── Viewer ───────────────────────────────────────────────────────────────────

  var currentItem = null;

  function openItem(item) {
    currentItem = item;
    docItems.concat(skillItems).forEach(function (entry) {
      if (entry._button) {
        entry._button.classList.toggle("active", entry === item);
      }
    });

    viewerType.textContent = item.group;
    viewerTitle.textContent = item.title;
    viewerSummary.textContent = item.summary || "";
    openRawLink.href = item.path;

    // Show/hide custom doc controls
    var isCustom = !!item.isCustom;
    viewerCustomActions.style.display = isCustom ? "flex" : "none";
    customDocBanner.style.display = isCustom ? "block" : "none";
    openRawLink.style.display = isCustom ? "none" : "";

    var raw = isCustom ? item.content : previewContent[item.path];
    if (raw) {
      docPreview.innerHTML = renderMarkdown(raw);
    } else {
      docPreview.innerHTML =
        "<p>No embedded preview is available for this file yet.</p>" +
        '<p><a href="' + escapeAttr(item.path) + '">Open the raw file</a>.</p>';
    }
  }

  // ── Edit / Delete / Download handlers ───────────────────────────────────────

  if (editDocBtn) {
    editDocBtn.addEventListener("click", function () {
      if (currentItem && currentItem.isCustom) {
        openAddDocModal(currentItem.section || "docs", currentItem);
      }
    });
  }

  if (downloadDocBtn) {
    downloadDocBtn.addEventListener("click", function () {
      if (!currentItem || !currentItem.isCustom) return;
      var content = currentItem.content || "";
      var filename = (currentItem.path || "custom/doc.md").split("/").pop();
      var blob = new Blob([content], { type: "text/markdown" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (deleteDocBtn) {
    deleteDocBtn.addEventListener("click", function () {
      if (!currentItem || !currentItem.isCustom) return;
      if (!confirm('Delete "' + currentItem.title + '"? This cannot be undone.')) return;
      deleteCustomDoc(currentItem.id);
    });
  }

  function deleteCustomDoc(id) {
    var stored = loadStoredCustomDocs().filter(function (d) { return d.id !== id; });
    saveStoredCustomDocs(stored);

    // Remove from in-memory arrays and re-render nav
    var idxDoc = docItems.findIndex(function (d) { return d.id === id; });
    if (idxDoc !== -1) docItems.splice(idxDoc, 1);
    var idxSkill = skillItems.findIndex(function (d) { return d.id === id; });
    if (idxSkill !== -1) skillItems.splice(idxSkill, 1);

    renderNav(docsNav, docItems);
    renderNav(skillsNav, skillItems);
    rebindCollapseHandlers();

    // Open next available item or clear viewer
    var next = docItems[0] || skillItems[0];
    if (next) {
      openItem(next);
    } else {
      viewerTitle.textContent = "";
      viewerSummary.textContent = "";
      docPreview.innerHTML = "";
      viewerCustomActions.style.display = "none";
      customDocBanner.style.display = "none";
    }
  }

  // ── Add / Edit Doc Modal ─────────────────────────────────────────────────────

  var addDocModal = document.getElementById("addDocModal");
  var addDocModalTitle = document.getElementById("addDocModalTitle");
  var addDocTitleInput = document.getElementById("addDocTitle");
  var addDocSummaryInput = document.getElementById("addDocSummary");
  var addDocContentInput = document.getElementById("addDocContent");
  var addDocFilenameInput = document.getElementById("addDocFilename");
  var saveDocBtn = document.getElementById("saveDocBtn");
  var cancelAddDocBtn = document.getElementById("cancelAddDocBtn");
  var closeAddDocModalBtn = document.getElementById("closeAddDocModal");

  var editingDocId = null;
  var modalSection = "docs";

  function openAddDocModal(section, existingItem) {
    modalSection = section || "docs";
    editingDocId = existingItem ? existingItem.id : null;
    addDocModalTitle.textContent = existingItem ? "Edit Document" : "Add Document";

    addDocTitleInput.value = existingItem ? existingItem.title : "";
    addDocSummaryInput.value = existingItem ? (existingItem.summary || "") : "";
    addDocContentInput.value = existingItem ? (existingItem.content || "") : "";
    addDocFilenameInput.value = existingItem ? existingItem.path : "";

    addDocModal.style.display = "flex";
    addDocTitleInput.focus();
  }

  function closeAddDocModal() {
    addDocModal.style.display = "none";
    editingDocId = null;
  }

  if (closeAddDocModalBtn) closeAddDocModalBtn.addEventListener("click", closeAddDocModal);
  if (cancelAddDocBtn) cancelAddDocBtn.addEventListener("click", closeAddDocModal);
  if (addDocModal) {
    addDocModal.addEventListener("click", function (e) {
      if (e.target === addDocModal) closeAddDocModal();
    });
  }

  // Auto-generate filename from title
  if (addDocTitleInput) {
    addDocTitleInput.addEventListener("input", function () {
      if (editingDocId) return; // Don't overwrite filename while editing
      var slug = addDocTitleInput.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      addDocFilenameInput.value = slug ? "custom/" + slug + ".md" : "";
    });
  }

  if (saveDocBtn) {
    saveDocBtn.addEventListener("click", function () {
      var title = addDocTitleInput.value.trim();
      if (!title) {
        addDocTitleInput.focus();
        return;
      }

      var path = addDocFilenameInput.value.trim() || "custom/" + slugify(title) + ".md";
      var docEntry = {
        id: editingDocId || Date.now(),
        title: title,
        summary: addDocSummaryInput.value.trim(),
        path: path,
        content: addDocContentInput.value,
        section: modalSection,
        isCustom: true,
        group: modalSection === "skills" ? "Skill" : "Document"
      };

      var stored = loadStoredCustomDocs();
      if (editingDocId) {
        var idx = stored.findIndex(function (d) { return d.id === editingDocId; });
        if (idx !== -1) stored[idx] = docEntry;

        // Update in-memory item
        var arr = modalSection === "skills" ? skillItems : docItems;
        var memIdx = arr.findIndex(function (d) { return d.id === editingDocId; });
        if (memIdx !== -1) {
          Object.assign(arr[memIdx], docEntry);
          if (arr[memIdx]._button) {
            arr[memIdx]._button.textContent = title;
            arr[memIdx]._button.title = title + (docEntry.summary ? " — " + docEntry.summary : "");
          }
        }
      } else {
        stored.push(docEntry);
        var targetArr = modalSection === "skills" ? skillItems : docItems;
        targetArr.push(docEntry);
        var targetNav = modalSection === "skills" ? skillsNav : docsNav;
        // Add single nav item without full re-render to preserve order
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "nav-item nav-item--custom";
        btn.title = title + (docEntry.summary ? " — " + docEntry.summary : "");
        btn.textContent = title;
        btn.addEventListener("click", function () { openItem(docEntry); });
        targetNav.appendChild(btn);
        docEntry._button = btn;
      }

      saveStoredCustomDocs(stored);
      closeAddDocModal();
      openItem(docEntry);
    });
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "doc";
  }

  // ── Wire up sidebar + buttons ─────────────────────────────────────────────────

  document.querySelectorAll(".sidebar-add-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      openAddDocModal(btn.getAttribute("data-section"));
    });
  });

  // ── Markdown renderer ─────────────────────────────────────────────────────────

  function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r/g, "").split("\n");
    const html = [];
    let paragraph = [];
    let listItems = [];
    let quoteLines = [];
    let inCode = false;
    let codeLines = [];
    let tableRows = []; // each entry is an array of cell strings

    function flushParagraph() {
      if (!paragraph.length) return;
      html.push("<p>" + renderInline(paragraph.join(" ")) + "</p>");
      paragraph = [];
    }

    function flushList() {
      if (!listItems.length) return;
      html.push("<ul>" + listItems.map(function (item) {
        return "<li>" + renderInline(item) + "</li>";
      }).join("") + "</ul>");
      listItems = [];
    }

    function flushQuote() {
      if (!quoteLines.length) return;
      html.push("<blockquote>" + renderInline(quoteLines.join(" ")) + "</blockquote>");
      quoteLines = [];
    }

    function flushCode() {
      if (!inCode) return;
      html.push("<pre><code>" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
      codeLines = [];
      inCode = false;
    }

    function flushTable() {
      if (!tableRows.length) return;
      var parts = ["<table>"];
      tableRows.forEach(function (row, idx) {
        if (idx === 0) {
          parts.push("<thead><tr>");
          row.forEach(function (c) { parts.push("<th>" + renderInline(c.trim()) + "</th>"); });
          parts.push("</tr></thead><tbody>");
        } else {
          parts.push("<tr>");
          row.forEach(function (c) { parts.push("<td>" + renderInline(c.trim()) + "</td>"); });
          parts.push("</tr>");
        }
      });
      parts.push("</tbody></table>");
      html.push(parts.join(""));
      tableRows = [];
    }

    function isTableSeparator(line) {
      // Matches lines like |---|---| or |:---|:---:|
      return /^\|[\s\-|:]+\|$/.test(line.trim()) && line.indexOf("-") !== -1;
    }

    lines.forEach(function (line) {
      if (line.startsWith("```")) {
        flushParagraph(); flushList(); flushQuote(); flushTable();
        if (inCode) { flushCode(); } else { inCode = true; codeLines = []; }
        return;
      }
      if (inCode) { codeLines.push(line); return; }
      if (!line.trim()) { flushParagraph(); flushList(); flushQuote(); flushTable(); return; }

      // Horizontal rule
      if (/^---+$/.test(line.trim())) {
        flushParagraph(); flushList(); flushQuote(); flushTable();
        html.push("<hr>");
        return;
      }

      // Table row
      if (/^\|/.test(line)) {
        flushParagraph(); flushList(); flushQuote();
        if (isTableSeparator(line)) return; // skip separator row
        var cells = line.split("|").slice(1, -1);
        tableRows.push(cells);
        return;
      }

      // Non-table line — flush any open table first
      if (tableRows.length) flushTable();

      if (/^#{1,3}\s/.test(line)) {
        flushParagraph(); flushList(); flushQuote();
        const level = line.match(/^#+/)[0].length;
        html.push("<h" + level + ">" + renderInline(line.slice(level + 1)) + "</h" + level + ">");
        return;
      }
      if (/^- /.test(line)) { flushParagraph(); flushQuote(); listItems.push(line.slice(2)); return; }
      if (/^> /.test(line)) { flushParagraph(); flushList(); quoteLines.push(line.slice(2)); return; }
      paragraph.push(line.trim());
    });

    flushParagraph(); flushList(); flushQuote(); flushCode(); flushTable();
    return html.join("");
  }

  function renderInline(text) {
    return escapeHtml(text)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return String(value).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // ── Mobile drawer ─────────────────────────────────────────────────────────────
  var docsSidebar = document.getElementById("docsSidebar");
  var docsMenuToggle = document.getElementById("docsMenuToggle");
  var docsDrawerBackdrop = document.getElementById("docsDrawerBackdrop");
  var docsTopbarLabel = document.getElementById("docsTopbarLabel");

  function openDrawer() {
    if (docsSidebar) docsSidebar.classList.add("is-open");
    if (docsDrawerBackdrop) docsDrawerBackdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (docsSidebar) docsSidebar.classList.remove("is-open");
    if (docsDrawerBackdrop) docsDrawerBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (docsMenuToggle) docsMenuToggle.addEventListener("click", openDrawer);
  if (docsDrawerBackdrop) docsDrawerBackdrop.addEventListener("click", closeDrawer);

  // Patch openItem to update topbar label + close drawer on mobile
  var _origOpenItem = openItem;
  openItem = function (item) {
    _origOpenItem(item);
    if (docsTopbarLabel) docsTopbarLabel.textContent = item.title;
    closeDrawer();
  };

  // ── Sidebar resize handle ─────────────────────────────────────────────────────
  var docsResizeHandle = document.getElementById("docsResizeHandle");
  var SIDEBAR_WIDTH_KEY = "lbm.sidebar.width";

  (function initSidebarResize() {
    var savedWidth = parseInt(localStorage.getItem(SIDEBAR_WIDTH_KEY), 10);
    if (savedWidth && savedWidth >= 140 && savedWidth <= 480) {
      docsSidebar.style.width = savedWidth + "px";
    }
    if (!docsResizeHandle) return;

    var isDragging = false;
    var startX = 0;
    var startWidth = 0;

    docsResizeHandle.addEventListener("mousedown", function (e) {
      isDragging = true;
      startX = e.clientX;
      startWidth = docsSidebar.offsetWidth;
      docsResizeHandle.classList.add("is-dragging");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      var delta = e.clientX - startX;
      var newWidth = Math.min(480, Math.max(140, startWidth + delta));
      docsSidebar.style.width = newWidth + "px";
    });

    document.addEventListener("mouseup", function () {
      if (!isDragging) return;
      isDragging = false;
      docsResizeHandle.classList.remove("is-dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(SIDEBAR_WIDTH_KEY, docsSidebar.offsetWidth);
    });
  })();

  // ── Collapsible sidebar sections ─────────────────────────────────────────────

  function rebindCollapseHandlers() {
    document.querySelectorAll(".sidebar-section-label[data-target]").forEach(function (label) {
      var targetId = label.getAttribute("data-target");
      var items = document.getElementById(targetId);
      var storageKey = "lbm.sidebar.collapsed." + targetId;
      var collapseBtn = label.querySelector(".sidebar-collapse-btn");
      if (!collapseBtn || !items) return;

      // Restore state
      if (localStorage.getItem(storageKey) === "1") {
        label.setAttribute("aria-expanded", "false");
        items.classList.add("collapsed");
      }

      // Remove old listener by cloning
      var newBtn = collapseBtn.cloneNode(true);
      collapseBtn.parentNode.replaceChild(newBtn, collapseBtn);

      newBtn.addEventListener("click", function () {
        var collapsed = items.classList.toggle("collapsed");
        label.setAttribute("aria-expanded", collapsed ? "false" : "true");
        localStorage.setItem(storageKey, collapsed ? "1" : "0");
      });
    });
  }

  rebindCollapseHandlers();
})();
