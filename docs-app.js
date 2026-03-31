(function () {
  const data = window.MCCProjectData;
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

  docsReviewedOn.textContent = "Reviewed " + data.project.reviewedOn;
  docsMaintainedBy.textContent = "Seeded by " + data.project.maintainedBy;

  const docItems = data.docs.map(function (item) {
    return Object.assign({ group: "Document" }, item);
  });
  const skillItems = data.skills.map(function (item) {
    return Object.assign({ group: "Skill" }, item);
  });

  renderNav(docsNav, docItems);
  renderNav(skillsNav, skillItems);
  if (docItems.length) {
    openItem(docItems[0]);
  }

  function renderNav(container, items) {
    items.forEach(function (item) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nav-item";
      button.title = item.summary;
      button.textContent = item.title;
      button.addEventListener("click", function () {
        openItem(item);
      });
      container.appendChild(button);
      item._button = button;
    });
  }

  function openItem(item) {
    docItems.concat(skillItems).forEach(function (entry) {
      if (entry._button) {
        entry._button.classList.toggle("active", entry.path === item.path);
      }
    });

    viewerType.textContent = item.group;
    viewerTitle.textContent = item.title;
    viewerSummary.textContent = item.summary;
    openRawLink.href = item.path;

    const raw = previewContent[item.path];
    if (raw) {
      docPreview.innerHTML = renderMarkdown(raw);
    } else {
      docPreview.innerHTML =
        "<p>No embedded preview is available for this file yet.</p>" +
        '<p><a href="' + item.path + '">Open the raw file</a>.</p>';
    }
  }

  function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r/g, "").split("\n");
    const html = [];
    let paragraph = [];
    let listItems = [];
    let quoteLines = [];
    let inCode = false;
    let codeLines = [];

    function flushParagraph() {
      if (!paragraph.length) {
        return;
      }
      html.push("<p>" + renderInline(paragraph.join(" ")) + "</p>");
      paragraph = [];
    }

    function flushList() {
      if (!listItems.length) {
        return;
      }
      html.push("<ul>" + listItems.map(function (item) {
        return "<li>" + renderInline(item) + "</li>";
      }).join("") + "</ul>");
      listItems = [];
    }

    function flushQuote() {
      if (!quoteLines.length) {
        return;
      }
      html.push("<blockquote>" + renderInline(quoteLines.join(" ")) + "</blockquote>");
      quoteLines = [];
    }

    function flushCode() {
      if (!inCode) {
        return;
      }
      html.push("<pre><code>" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
      codeLines = [];
      inCode = false;
    }

    lines.forEach(function (line) {
      if (line.startsWith("```")) {
        flushParagraph();
        flushList();
        flushQuote();
        if (inCode) {
          flushCode();
        } else {
          inCode = true;
          codeLines = [];
        }
        return;
      }

      if (inCode) {
        codeLines.push(line);
        return;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList();
        flushQuote();
        return;
      }

      if (/^#{1,3}\s/.test(line)) {
        flushParagraph();
        flushList();
        flushQuote();
        const level = line.match(/^#+/)[0].length;
        html.push("<h" + level + ">" + renderInline(line.slice(level + 1)) + "</h" + level + ">");
        return;
      }

      if (/^- /.test(line)) {
        flushParagraph();
        flushQuote();
        listItems.push(line.slice(2));
        return;
      }

      if (/^> /.test(line)) {
        flushParagraph();
        flushList();
        quoteLines.push(line.slice(2));
        return;
      }

      paragraph.push(line.trim());
    });

    flushParagraph();
    flushList();
    flushQuote();
    flushCode();
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
})();
