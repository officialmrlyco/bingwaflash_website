/*
 * Shared theme controller: syncs theme across all Bingwa Flash pages.
 * Handles instant toggle, icon synchronization, and localStorage persistence.
 */
(function () {
  var root = document.documentElement;
  var key = "bf-theme";

  function getTheme() {
    try {
      var saved = localStorage.getItem(key);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return root.getAttribute("data-theme") || "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(key, theme); } catch (e) {}
    syncUI(theme);
  }

  function syncUI(theme) {
    var isDark = theme === "dark";
    document.querySelectorAll("[data-theme-toggle], .thm, .page-theme, .home-theme, .theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
      // Update sun/moon text or SVG icons
      var sunIcon = btn.querySelector("[data-theme-icon='sun'], #ico-sun");
      var moonIcon = btn.querySelector("[data-theme-icon='moon'], #ico-moon");
      if (sunIcon) sunIcon.style.display = isDark ? "inline-block" : "none";
      if (moonIcon) moonIcon.style.display = isDark ? "none" : "inline-block";
      // If button text has ☼ or ☾ directly
      if (!sunIcon && !moonIcon && (btn.textContent.includes("☼") || btn.textContent.includes("☾") || btn.textContent.includes("◐"))) {
        btn.textContent = isDark ? "☼" : "☾";
      }
    });
  }

  window.toggleTheme = function () {
    var current = root.getAttribute("data-theme") || "dark";
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  };

  // Event delegation on document ensures clicks always work regardless of render timing
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-theme-toggle], .thm, .page-theme, .home-theme, .theme-toggle");
    if (btn) {
      e.preventDefault();
      window.toggleTheme();
    }
  });

  // Mobile menu toggle delegation
  document.addEventListener("click", function (e) {
    var menuBtn = e.target.closest("[data-menu-toggle], .home-menu, .menu-toggle");
    if (menuBtn) {
      e.preventDefault();
      var nav = document.getElementById("homeNav") || document.getElementById("siteNav");
      if (nav) {
        nav.classList.toggle("is-open");
        var isOpen = nav.classList.contains("is-open");
        menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    }
  });

  // Initial sync
  var initial = getTheme();
  applyTheme(initial);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      syncUI(getTheme());
    });
  } else {
    syncUI(initial);
  }
})();
