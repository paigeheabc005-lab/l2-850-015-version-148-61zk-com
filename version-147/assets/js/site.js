(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var toggle = qs("[data-menu-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHeaderSearch() {
    qsa("[data-header-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = qsa(".hero-slide", slider);
    var dots = qsa("[data-hero-dot]");
    if (slides.length <= 1) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function initFilters() {
    var input = qs("[data-filter-input]");
    var list = qs("[data-filter-list]");
    var count = qs("[data-filter-count]");
    if (!input || !list) {
      return;
    }
    var cards = qsa(".movie-card", list);
    function apply() {
      var term = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var matched = !term || haystack.indexOf(term) !== -1;
        card.classList.toggle("is-hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + " 部影片";
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  function renderSearchCard(item) {
    var tags = (item.tags || [])
      .slice(0, 4)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");
    return (
      "" +
      '<article class="movie-card movie-card-standard">' +
      '<a class="poster-link" href="' +
      escapeHtml(item.url) +
      '" aria-label="观看 ' +
      escapeHtml(item.title) +
      '">' +
      '<img src="' +
      escapeHtml(item.cover) +
      '" alt="' +
      escapeHtml(item.title) +
      '" loading="lazy" />' +
      '<span class="play-chip">▶</span>' +
      "</a>" +
      '<div class="movie-card-body">' +
      '<div class="movie-meta-line">' +
      "<span>" +
      escapeHtml(item.year) +
      "</span>" +
      "<span>" +
      escapeHtml(item.region) +
      "</span>" +
      "<span>" +
      escapeHtml(item.type) +
      "</span>" +
      "</div>" +
      '<h3><a href="' +
      escapeHtml(item.url) +
      '">' +
      escapeHtml(item.title) +
      "</a></h3>" +
      "<p>" +
      escapeHtml(item.oneLine) +
      "</p>" +
      '<div class="tag-row">' +
      tags +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function initSearchPage() {
    var form = qs("[data-search-page-form]");
    var input = qs("[data-search-page-input]");
    var results = qs("[data-search-results]");
    var summary = qs("[data-search-summary]");
    if (!form || !input || !results || !summary) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    input.value = keyword;
    function render(term) {
      var q = term.trim().toLowerCase();
      if (!q) {
        summary.textContent = "请输入关键词开始搜索。";
        results.innerHTML = "";
        return;
      }
      var catalog = window.MOVIE_CATALOG || [];
      var matched = catalog.filter(function (item) {
        return item.search.indexOf(q) !== -1;
      });
      summary.textContent =
        "关键词 “" + term.trim() + "” 共找到 " + matched.length + " 部影片";
      results.innerHTML = matched.slice(0, 240).map(renderSearchCard).join("");
    }
    render(keyword);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
      window.history.replaceState(null, "", url);
      render(q);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
