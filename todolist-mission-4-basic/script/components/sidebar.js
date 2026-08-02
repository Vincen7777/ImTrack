import { signOut } from "../app.js";

const container = document.getElementById("app-sidebar");

if (container) {
  const inPages = window.location.pathname.includes("/pages/");
  const base = inPages ? "../components/" : "components/";
  const assetBase = inPages ? "../" : "";

  async function loadSidebar() {
    try {
      const res = await fetch(`${base}sidebar.html`);
      if (!res.ok) throw new Error("Sidebar gagal dimuat.");
      container.innerHTML = await res.text();

      const logo = container.querySelector(".sb-logo img");
      if (logo) logo.src = `${assetBase}public/img/logo.svg`;

      highlight();
      initEvents();
    } catch (err) {
      console.error(err);
    }
  }

  function highlight() {
    const current = window.location.pathname.split("/").pop() || "todo.html";
    container.querySelectorAll(".sb-item").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === current);
    });
  }

  function initEvents() {
    container.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (btn && btn.dataset.action === "signOut") signOut();
    });
  }

  loadSidebar();
}