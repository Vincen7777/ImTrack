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
    document.dispatchEvent(new CustomEvent("topbar:loaded"));
  } catch (err) {
    console.error(err);
  }
})();
