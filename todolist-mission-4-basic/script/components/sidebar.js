/**
 * sidebar.js — Load sidebar, highlight via pathname, fix logo path
 */
(function () {
  "use strict";
  var container = document.getElementById("app-sidebar");
  if (!container) return;

  var inPages = window.location.pathname.indexOf("/pages/") !== -1;
  var base = inPages ? "../components/" : "components/";
  var assetBase = inPages ? "../" : "";

  async function loadSidebar() {
    try {
      var res = await fetch(base + "sidebar.html");
      if (!res.ok) throw new Error("Sidebar gagal dimuat.");
      container.innerHTML = await res.text();

      var logo = container.querySelector(".sb-logo img");
      if (logo) logo.src = assetBase + "public/img/logo.svg";

      highlight();
      initEvents();
    } catch (err) {
      console.error(err);
    }
  }

  function highlight() {
    var current = window.location.pathname.split("/").pop() || "todo.html";
    container.querySelectorAll(".sb-item").forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === current);
    });
  }

  function initEvents() {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (btn && btn.dataset.action === "signOut") window.ImTrack.signOut();
    });
  }

  loadSidebar();
})();
