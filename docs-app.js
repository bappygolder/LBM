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
  const roadmapsNav = document.getElementById("roadmapsNav");
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
  const docPagination = document.getElementById("docPagination");
  const docToc = document.getElementById("docToc");
  const tocNav = document.getElementById("tocNav");
  const tocHideBtn = document.getElementById("tocHideBtn");
  const tocRevealBtn = document.getElementById("tocRevealBtn");
  const TOC_HIDDEN_KEY = "lbm.toc.hidden";

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
  const roadmapItems = (data.roadmaps || []).map(function (item) {
    return Object.assign({ group: "Roadmap" }, item);
  });

  // Load custom docs from localStorage and append to appropriate list
  var customDocs = loadStoredCustomDocs();
  customDocs.forEach(function (item) {
    var target = item.section === "skills" ? skillItems : docItems;
    target.push(Object.assign({ group: item.section === "skills" ? "Skill" : "Document", isCustom: true }, item));
  });

  renderNav(docsNav, docItems);
  renderNav(skillsNav, skillItems);
  renderNav(roadmapsNav, roadmapItems);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function allItems() {
    return docItems.concat(skillItems).concat(roadmapItems);
  }

  // ── Sidebar search ───────────────────────────────────────────────────────────

  var sidebarSearch       = document.getElementById("sidebarSearch");
  var sidebarSearchClear  = document.getElementById("sidebarSearchClear");
  var sidebarSearchArea   = document.getElementById("sidebarSearchArea");
  var sidebarSearchToggle = document.getElementById("sidebarSearchToggle");
  var sidebarHideBtn      = document.getElementById("sidebarHideBtn");
  var sidebarRevealBtn    = document.getElementById("sidebarRevealBtn");
  var docsPage            = document.querySelector(".docs-page");
  var SIDEBAR_COLLAPSED_KEY = "lbm.sidebar.docs.collapsed";

  function applySearch(query) {
    var q = query.trim().toLowerCase();
    allItems().forEach(function (item) {
      if (!item._button) return;
      var match = !q || item.title.toLowerCase().indexOf(q) !== -1 ||
        (item.summary && item.summary.toLowerCase().indexOf(q) !== -1);
      item._button.style.display = match ? "" : "none";
    });
    document.querySelectorAll(".sidebar-section").forEach(function (section) {
      var btns = section.querySelectorAll(".nav-item");
      var anyVisible = Array.prototype.some.call(btns, function (b) { return b.style.display !== "none"; });
      section.style.display = anyVisible ? "" : "none";
    });
    if (sidebarSearchClear) sidebarSearchClear.hidden = !query.trim();
  }

  function expandSearch() {
    if (sidebarSearchArea) sidebarSearchArea.classList.add("is-expanded");
  }

  function collapseSearch() {
    if (sidebarSearchArea && sidebarSearch && !sidebarSearch.value) {
      sidebarSearchArea.classList.remove("is-expanded");
    }
  }

  if (sidebarSearchToggle) {
    sidebarSearchToggle.addEventListener("click", function () {
      expandSearch();
      if (sidebarSearch) sidebarSearch.focus();
    });
  }

  if (sidebarSearch) {
    sidebarSearch.addEventListener("input", function () { applySearch(sidebarSearch.value); });
    sidebarSearch.addEventListener("blur", collapseSearch);
    sidebarSearch.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        sidebarSearch.value = "";
        applySearch("");
        collapseSearch();
        sidebarSearch.blur();
      }
    });
  }

  if (sidebarSearchClear) {
    sidebarSearchClear.addEventListener("click", function () {
      sidebarSearch.value = "";
      applySearch("");
      sidebarSearch.focus();
    });
  }

  // ── Sidebar hide / show ───────────────────────────────────────────────────────

  function setSidebarCollapsed(collapsed) {
    if (!docsPage) return;
    docsPage.classList.toggle("sidebar-collapsed", collapsed);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  }

  if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") setSidebarCollapsed(true);
  if (sidebarHideBtn) sidebarHideBtn.addEventListener("click", function () { setSidebarCollapsed(true); });
  if (sidebarRevealBtn) sidebarRevealBtn.addEventListener("click", function () { setSidebarCollapsed(false); });

  // ── Keyboard shortcuts: S = focus search  |  ← → = prev/next doc ─────────────

  document.addEventListener("keydown", function (e) {
    var tag = document.activeElement ? document.activeElement.tagName : "";
    if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey) return;

    if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      setSidebarCollapsed(false);
      expandSearch();
      if (sidebarSearch) sidebarSearch.focus();
      return;
    }

    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    var all = allItems().filter(function (item) { return item._button && item._button.style.display !== "none"; });
    if (!all.length || !currentItem) return;

    var idx = all.indexOf(currentItem);
    var target = null;
    if (e.key === "ArrowLeft" && idx > 0) target = all[idx - 1];
    else if (e.key === "ArrowRight" && idx < all.length - 1) target = all[idx + 1];

    if (target) {
      e.preventDefault();
      openItem(target);
    }
  });

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
    docItems.concat(skillItems).concat(roadmapItems).forEach(function (entry) {
      if (entry._button) {
        entry._button.classList.toggle("active", entry === item);
      }
    });
    // Scroll active nav item into view (no-op if already visible)
    if (item._button) item._button.scrollIntoView({ block: "nearest" });

    if (item.lastUpdated) {
      var d = new Date(item.lastUpdated + "T00:00:00");
      viewerType.textContent = "Last updated " + d.toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" });
    } else {
      viewerType.textContent = "";
    }
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
      // Strip leading H1 from built-in docs — the viewer header already shows item.title
      var content = isCustom ? raw : raw.replace(/^# [^\n]*\n?/, "");
      docPreview.innerHTML = renderMarkdown(content);
    } else {
      docPreview.innerHTML =
        "<p>No embedded preview is available for this file yet.</p>" +
        '<p><a href="' + escapeAttr(item.path) + '">Open the raw file</a>.</p>';
    }

    // Reset scroll so ToC alignment measurement is always from a known position
    var docsViewerEl = document.querySelector(".docs-viewer");
    if (docsViewerEl) docsViewerEl.scrollTop = 0;

    buildToc();
    renderPagination(item);
  }

  // ── URL routing: open initial doc (runs after var currentItem = null above) ───
  (function () {
    var params = new URLSearchParams(window.location.search);
    var docParam = params.get("doc");
    var items = allItems();
    var target = null;
    if (docParam) target = items.find(function (item) { return item.path === docParam; }) || null;
    if (!target && docItems.length) target = docItems[0];
    if (target) openItem(target);
  })();

  // ── On-this-page ToC ─────────────────────────────────────────────────────────

  function slugifyHeading(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
  }

  function buildToc() {
    if (!tocNav || !docToc) return;
    var headings = docPreview.querySelectorAll("h2, h3");

    if (headings.length < 2) {
      docToc.classList.add("doc-toc--empty");
      tocNav.innerHTML = "";
      if (tocRevealBtn) tocRevealBtn.style.display = "";
      return;
    }

    docToc.classList.remove("doc-toc--empty");
    // Update reveal button: show if user has the ToC hidden
    if (tocRevealBtn) {
      tocRevealBtn.style.display = docToc.classList.contains("doc-toc--hidden") ? "flex" : "";
    }

    // Assign IDs to headings for anchor linking
    var usedIds = {};
    headings.forEach(function (h) {
      var base = slugifyHeading(h.textContent);
      var id = base;
      var count = 1;
      while (usedIds[id]) { id = base + "-" + (++count); }
      usedIds[id] = true;
      h.id = id;
    });

    // Build nav items
    var fragment = document.createDocumentFragment();
    headings.forEach(function (h) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "toc-item toc-item--" + h.tagName.toLowerCase();
      btn.textContent = h.textContent;
      btn.addEventListener("click", function () {
        var docsViewer = document.querySelector(".docs-viewer");
        if (docsViewer) {
          var offset = h.getBoundingClientRect().top - docsViewer.getBoundingClientRect().top + docsViewer.scrollTop - 12;
          docsViewer.scrollTo({ top: offset, behavior: "smooth" });
        } else {
          h.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        // Highlight active item
        tocNav.querySelectorAll(".toc-item").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
      fragment.appendChild(btn);
    });

    tocNav.innerHTML = "";
    tocNav.appendChild(fragment);

    // Align ToC with the separator line (border-bottom of viewer-header)
    // Uses viewerHeader.bottom - docsViewer.top so scroll position never interferes
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var docsViewer = document.querySelector(".docs-viewer");
        var viewerHeader = document.querySelector(".viewer-header");
        if (!docsViewer || !viewerHeader) return;
        var viewerTop = docsViewer.getBoundingClientRect().top;
        var headerBottom = viewerHeader.getBoundingClientRect().bottom;
        var offset = Math.max(16, headerBottom - viewerTop);
        docToc.style.paddingTop = offset + "px";
      });
    });

    // Scroll-spy: highlight the closest heading above scroll position
    var docsViewer = document.querySelector(".docs-viewer");
    if (docsViewer) {
      docsViewer.addEventListener("scroll", onViewerScroll, { passive: true });
    }
  }

  function onViewerScroll() {
    if (!tocNav || !docPreview) return;
    var docsViewer = document.querySelector(".docs-viewer");
    if (!docsViewer) return;
    var scrollTop = docsViewer.scrollTop;
    var viewerTop = docsViewer.getBoundingClientRect().top;
    var headings = docPreview.querySelectorAll("h2, h3");
    var active = null;
    headings.forEach(function (h) {
      var top = h.getBoundingClientRect().top - viewerTop + scrollTop;
      if (top <= scrollTop + 40) active = h.id;
    });
    tocNav.querySelectorAll(".toc-item").forEach(function (btn) {
      var matches = active && btn.textContent === document.getElementById(active).textContent;
      btn.classList.toggle("is-active", !!matches);
    });
  }

  // ToC hide / show
  function setTocHidden(hidden) {
    if (!docToc) return;
    docToc.classList.toggle("doc-toc--hidden", hidden);
    var hasContent = !docToc.classList.contains("doc-toc--empty");
    if (tocRevealBtn) tocRevealBtn.style.display = hidden && hasContent ? "flex" : "";
    localStorage.setItem(TOC_HIDDEN_KEY, hidden ? "1" : "0");
  }

  if (localStorage.getItem(TOC_HIDDEN_KEY) === "1") setTocHidden(true);

  if (tocHideBtn) {
    tocHideBtn.addEventListener("click", function () { setTocHidden(true); });
  }
  if (tocRevealBtn) {
    tocRevealBtn.addEventListener("click", function () { setTocHidden(false); });
  }

  // ── Prev / Next pagination ────────────────────────────────────────────────────

  function renderPagination(item) {
    if (!docPagination) return;
    var list = item.group === "Skill" ? skillItems : item.group === "Roadmap" ? roadmapItems : docItems;
    var idx = list.indexOf(item);
    var prev = idx > 0 ? list[idx - 1] : null;
    var next = idx < list.length - 1 ? list[idx + 1] : null;

    if (!prev && !next) {
      docPagination.style.display = "none";
      docPagination.innerHTML = "";
      return;
    }

    docPagination.style.display = "flex";
    var parts = [];

    if (prev) {
      parts.push(
        '<button class="doc-pagination-btn doc-pagination-btn--prev" data-idx="' + (idx - 1) + '" data-group="' + escapeAttr(item.group) + '" type="button">' +
        '<span class="doc-pagination-label">Previous</span>' +
        '<span class="doc-pagination-title">' + escapeHtml(prev.title) + '</span>' +
        '</button>'
      );
    } else {
      parts.push('<span style="flex:1"></span>');
    }

    if (next) {
      parts.push(
        '<button class="doc-pagination-btn doc-pagination-btn--next" data-idx="' + (idx + 1) + '" data-group="' + escapeAttr(item.group) + '" type="button">' +
        '<span class="doc-pagination-label">Next</span>' +
        '<span class="doc-pagination-title">' + escapeHtml(next.title) + '</span>' +
        '</button>'
      );
    }

    docPagination.innerHTML = parts.join("");

    docPagination.querySelectorAll(".doc-pagination-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.getAttribute("data-idx"), 10);
        var grp = btn.getAttribute("data-group");
        var targetList = grp === "Skill" ? skillItems : docItems;
        if (targetList[i]) openItem(targetList[i]);
      });
    });
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
    let orderedItems = []; // each: { text: string, subs: string[] }
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

    function flushOrderedList() {
      if (!orderedItems.length) return;
      var parts = ["<ol>"];
      orderedItems.forEach(function (item) {
        if (item.subs.length) {
          parts.push("<li>" + renderInline(item.text) +
            "<ul>" + item.subs.map(function (s) { return "<li>" + renderInline(s) + "</li>"; }).join("") + "</ul>" +
            "</li>");
        } else {
          parts.push("<li>" + renderInline(item.text) + "</li>");
        }
      });
      parts.push("</ol>");
      html.push(parts.join(""));
      orderedItems = [];
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
      var parts = ['<div class="table-scroll"><table>'];
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
      parts.push("</tbody></table></div>");
      html.push(parts.join(""));
      tableRows = [];
    }

    function isTableSeparator(line) {
      // Matches lines like |---|---| or |:---|:---:|
      return /^\|[\s\-|:]+\|$/.test(line.trim()) && line.indexOf("-") !== -1;
    }

    lines.forEach(function (line) {
      if (line.startsWith("```")) {
        flushParagraph(); flushList(); flushOrderedList(); flushQuote(); flushTable();
        if (inCode) { flushCode(); } else { inCode = true; codeLines = []; }
        return;
      }
      if (inCode) { codeLines.push(line); return; }
      if (!line.trim()) { flushParagraph(); flushList(); flushOrderedList(); flushQuote(); flushTable(); return; }

      // Horizontal rule
      if (/^---+$/.test(line.trim())) {
        flushParagraph(); flushList(); flushOrderedList(); flushQuote(); flushTable();
        html.push("<hr>");
        return;
      }

      // Table row
      if (/^\|/.test(line)) {
        flushParagraph(); flushList(); flushOrderedList(); flushQuote();
        if (isTableSeparator(line)) return; // skip separator row
        var cells = line.split("|").slice(1, -1);
        tableRows.push(cells);
        return;
      }

      // Non-table line — flush any open table first
      if (tableRows.length) flushTable();

      if (/^#{1,3}\s/.test(line)) {
        flushParagraph(); flushList(); flushOrderedList(); flushQuote();
        const level = line.match(/^#+/)[0].length;
        html.push("<h" + level + ">" + renderInline(line.slice(level + 1)) + "</h" + level + ">");
        return;
      }
      // Ordered list item: "1. text"
      if (/^\d+\. /.test(line)) {
        flushParagraph(); flushList(); flushQuote();
        orderedItems.push({ text: line.replace(/^\d+\. /, ""), subs: [] });
        return;
      }
      // Indented sub-bullet inside an ordered list: "   - text"
      if (/^\s+- /.test(line) && orderedItems.length) {
        orderedItems[orderedItems.length - 1].subs.push(line.replace(/^\s+- /, ""));
        return;
      }
      if (/^- /.test(line)) { flushParagraph(); flushOrderedList(); flushQuote(); listItems.push(line.slice(2)); return; }
      if (/^> /.test(line)) { flushParagraph(); flushList(); flushOrderedList(); quoteLines.push(line.slice(2)); return; }
      paragraph.push(line.trim());
    });

    flushParagraph(); flushList(); flushOrderedList(); flushQuote(); flushCode(); flushTable();
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
