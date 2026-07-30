/**
 * app.js — Shared utilities
 * Namespace: window.ImTrack
 */
(function () {
  "use strict";
  const Im = (window.ImTrack = window.ImTrack || {});

  let toastTimer = null;
  Im.toast = function (msg, ms = 2500) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), ms);
  };

  Im.esc = function (str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  Im.fmtDate = function (isoDate) {
    return new Date(isoDate + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  Im.fmtFullDate = function () {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  Im.showErr = function (id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.add("on");
    }
  };
  Im.clearErr = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("on");
  };
  Im.notImpl = function (name) {
    Im.toast(`"${name}" belum tersedia`);
    return false;
  };
  Im.signOut = function () {
    if (confirm("Keluar dari ImTrack?")) window.location.href = "sign-in.html";
  };
})();
