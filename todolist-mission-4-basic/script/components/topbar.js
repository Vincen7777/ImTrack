const container = document.getElementById("app-topbar");

if (container) {
  const base = window.location.pathname.includes("/pages/")
    ? "../components/"
    : "components/";

  (async () => {
    try {
      const res = await fetch(`${base}topbar.html`);
      if (!res.ok) throw new Error("Gagal memuat topbar.");
      container.innerHTML = await res.text();

      // --- sidebar drawer toggle (mobile) ---
      const sidebar = document.getElementById("app-sidebar");
      if (sidebar) {
        const hamburger = document.getElementById("hamburger-btn");
        let overlay = document.getElementById("sidebar-overlay");

        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "sidebar-overlay";
          overlay.className = "sidebar-overlay";
          document.body.appendChild(overlay);
        }

        const openSidebar = () => {
          sidebar.classList.add("open");
          overlay.classList.add("show");
          if (hamburger) hamburger.setAttribute("aria-expanded", "true");
        };

        const closeSidebar = () => {
          sidebar.classList.remove("open");
          overlay.classList.remove("show");
          if (hamburger) hamburger.setAttribute("aria-expanded", "false");
        };

        if (hamburger) {
          hamburger.addEventListener("click", () => {
            sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
          });
        }

        overlay.addEventListener("click", closeSidebar);

        // Tutup sidebar jika klik link navigasi di dalam sidebar
        sidebar.addEventListener("click", (e) => {
          if (e.target.closest(".sb-item")) closeSidebar();
        });

        // Tutup sidebar dengan tombol Escape
        document.addEventListener("keydown", (e) => {
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
}