/**
 * topbar.js — Load topbar
 */
(async function () {
  "use strict";
  var container = document.getElementById("app-topbar");
  if (!container) return;

  var base =
    window.location.pathname.indexOf("/pages/") !== -1
      ? "../components/"
      : "components/";

  try {
    var res = await fetch(base + "topbar.html");
    if (!res.ok) throw new Error("Gagal memuat topbar.");
    container.innerHTML = await res.text();

    // --- sidebar drawer toggle (mobile) ---
    var sidebar = document.getElementById("app-sidebar");
    if (sidebar) {
      var hamburger = document.getElementById("hamburger-btn");
      var overlay = document.getElementById("sidebar-overlay");

      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "sidebar-overlay";
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
      }

      function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("show");
        if (hamburger) hamburger.setAttribute("aria-expanded", "true");
      }

      function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        if (hamburger) hamburger.setAttribute("aria-expanded", "false");
      }

      if (hamburger) {
        hamburger.addEventListener("click", function () {
          sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
        });
      }

      overlay.addEventListener("click", closeSidebar);

      // Tutup sidebar jika klik link navigasi di dalam sidebar
      sidebar.addEventListener("click", function (e) {
        if (e.target.closest(".sb-item")) closeSidebar();
      });

      // Tutup sidebar dengan tombol Escape
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && sidebar.classList.contains("open")) {
          closeSidebar();
        }
      });
    }

    document.dispatchEvent(new CustomEvent("topbar:loaded"));
  } catch (err) {
    console.error(err);
  }
})();
