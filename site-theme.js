/* Shared theme controller: one preference keeps every Bingwa Flash page in sync. */
(function () {
  var root = document.documentElement;
  var key = "bf-theme";
  var saved = null;
  // Private browsing or a blocked storage policy must not break a usable page theme.
  try { saved = localStorage.getItem(key); } catch (error) { saved = null; }
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  function sync() {
    var dark = root.getAttribute("data-theme") !== "light";
    document.querySelectorAll("[data-theme-toggle], .thm, .page-theme").forEach(function (button) {
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      button.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
    });
    document.querySelectorAll("[data-theme-icon='moon'], #ico-moon").forEach(function (icon) { icon.style.display = dark ? "block" : "none"; });
    document.querySelectorAll("[data-theme-icon='sun'], #ico-sun").forEach(function (icon) { icon.style.display = dark ? "none" : "block"; });
  }

  window.toggleTheme = function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(key, next); } catch (error) { /* Keep the choice for this page in memory. */ }
    sync();
  };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", window.toggleTheme);
    });
    sync();
  });
}());
