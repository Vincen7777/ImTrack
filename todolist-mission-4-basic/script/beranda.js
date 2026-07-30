/**
 * beranda.js — Controller: init, render, page detection via location.pathname
 * Uses: ImTrack.store (data) + ImTrack.modal (modal on todo page)
 */
(function () {
  "use strict";
  var Im = window.ImTrack;
  var S = Im.store;
  var M = Im.modal;

  var isDonePage = window.location.pathname.indexOf("done") !== -1;

  var notifications = [
    {
      id: "n1",
      text: "Selamat datang di ImTrack! Mulai tambahkan tugasmu hari ini.",
      time: "Baru saja",
      read: false,
    },
  ];

  var el = function (id) {
    return document.getElementById(id);
  };
  var todayStr = function () {
    return new Date().toISOString().split("T")[0];
  };
  var isOverdue = function (t) {
    return t.due && t.status !== "done" && t.due < todayStr();
  };

  var CFG = {
    High: {
      l: "Prioritas Tinggi",
      icon: "ph-fill ph-fire",
      ico: "#ef4444",
      bg: "#fef2f2",
      fg: "#b91c1c",
      badge:
        '<span class="prio-badge" style="background:#fef2f2;color:#ef4444">Fokus Utama</span>',
    },
    Medium: {
      l: "Prioritas Sedang",
      icon: "ph-fill ph-clock",
      ico: "#d97706",
      bg: "#fffbeb",
      fg: "#92400e",
      badge: "",
    },
    Low: {
      l: "Prioritas Rendah",
      icon: "ph-fill ph-feather",
      ico: "#3b82f6",
      bg: "#eff6ff",
      fg: "#1d4ed8",
      badge: "",
    },
  };

  function dateCell(t) {
    return Im.fmtDate(t.due || t.dateAdded);
  }

  /* ── Render ────────────────────────────────────────────── */
  function render(filter) {
    filter = (filter || "").toLowerCase().trim();
    renderTodos(filter);
    renderDones(filter);
    var delAll = el("delete-all-btn");
    if (delAll) delAll.style.display = S.all().length ? "inline-flex" : "none";
  }

  function renderTodos(filter) {
    var root = el("priority-root");
    if (!root) return;
    var todos = S.filterByStatus("todo", filter).sort(function (a, b) {
      return isOverdue(b) - isOverdue(a);
    });
    var html = "";

    ["High", "Medium", "Low"].forEach(function (prio) {
      var pts = todos.filter(function (t) {
        return t.priority === prio;
      });
      var cfg = CFG[prio];
      var rows = pts.length
        ? pts.map(todoRow).join("")
        : '<tr><td colspan="4" class="table-empty"><span>Tidak ada tugas</span></td></tr>';

      html +=
        '<div class="prio-section">' +
        '<div class="prio-head" style="background:' +
        cfg.bg +
        ";color:" +
        cfg.fg +
        '">' +
        '<span class="prio-head-label"><i class="' +
        cfg.icon +
        '" style="color:' +
        cfg.ico +
        '"></i> ' +
        cfg.l +
        "</span>" +
        cfg.badge +
        '<span class="prio-count">' +
        pts.length +
        "</span>" +
        "</div>" +
        '<div class="prio-body">' +
        '<table class="todo-table"><thead><tr><th class="th-check">&#10003;</th><th class="th-text">Tugas</th><th class="th-date">Tanggal</th><th class="th-action">Hapus</th></tr></thead>' +
        "<tbody>" +
        rows +
        "</tbody></table>" +
        "</div>" +
        "</div>";
    });

    root.innerHTML =
      html ||
      '<div class="empty"><i class="ph ph-clipboard-text"></i><p>Belum ada tugas</p></div>';
  }

  function todoRow(t) {
    var ov = isOverdue(t)
      ? '<span class="overdue-tag"><i class="ph ph-warning"></i> Terlambat</span>'
      : "";
    return (
      '<tr class="todo-row' +
      (isOverdue(t) ? " overdue-row" : "") +
      '" data-id="' +
      t.id +
      '">' +
      '<td class="td-check"><input type="checkbox" class="task-cb" data-action="toggle"></td>' +
      '<td class="td-text"><span class="task-text-cell">' +
      Im.esc(t.text) +
      "</span>" +
      ov +
      "</td>" +
      '<td class="td-date">' +
      dateCell(t) +
      "</td>" +
      '<td class="td-action"><button class="icon-btn del-btn" data-action="delete"><i class="ph ph-trash"></i></button></td>' +
      "</tr>"
    );
  }

  function renderDones(filter) {
    var root = el("done-content");
    if (!root) return;
    var dones = S.filterByStatus("done", filter);
    var rows = dones.length
      ? dones.map(doneRow).join("")
      : '<tr><td colspan="4" class="table-empty"><span>Belum ada tugas yang diselesaikan</span></td></tr>';

    root.innerHTML =
      '<div class="prio-section">' +
      '<div class="prio-head" style="background:#ecfdf5;color:#065f46">' +
      '<span class="prio-head-label"><i class="ph-fill ph-check-circle" style="color:#10b981"></i> Done (Selesai)</span>' +
      '<span class="prio-count">' +
      dones.length +
      "</span>" +
      "</div>" +
      '<div class="prio-body">' +
      '<table class="todo-table"><thead><tr><th class="th-check">&#10003;</th><th class="th-text">Tugas</th><th class="th-date">Tanggal</th><th class="th-action">Hapus</th></tr></thead>' +
      "<tbody>" +
      rows +
      "</tbody></table>" +
      "</div>" +
      "</div>";
  }

  function doneRow(t) {
    return (
      '<tr class="todo-row" data-id="' +
      t.id +
      '">' +
      '<td class="td-check"><input type="checkbox" class="task-cb done-cb" checked data-action="toggle"></td>' +
      '<td class="td-text"><span class="task-text-cell done">' +
      Im.esc(t.text) +
      "</span></td>" +
      '<td class="td-date">' +
      dateCell(t) +
      "</td>" +
      '<td class="td-action"><button class="icon-btn del-btn" data-action="delete"><i class="ph ph-trash"></i></button></td>' +
      "</tr>"
    );
  }

  /* ── Actions ───────────────────────────────────────────── */
  function toggleTask(id) {
    var t = S.toggle(id);
    if (t) {
      render();
      Im.toast(t.status === "done" ? "Selesai!" : "Dikembalikan");
    }
  }
  function deleteTask(id) {
    if (S.remove(id)) {
      render();
      Im.toast("Tugas dihapus");
    }
  }

  function deleteAll() {
    if (!S.all().length) return;
    if (!confirm("Hapus semua tugas?")) return;
    S.removeAll();
    render();
    Im.toast("Semua tugas dihapus");
  }

  /* ── Notifications ─────────────────────────────────────── */
  function renderNotifs() {
    var unread = notifications.filter(function (n) {
      return !n.read;
    }).length;
    var dot = el("notif-dot");
    if (dot) dot.style.display = unread > 0 ? "block" : "none";

    var list = el("notif-list");
    if (!list) return;

    list.innerHTML = notifications.length
      ? notifications
          .map(function (n) {
            return (
              '<div class="notif-item" data-id="' +
              n.id +
              '" data-action="markRead">' +
              (n.read
                ? '<div class="notif-spacer"></div>'
                : '<div class="notif-dot"></div>') +
              '<div><p class="notif-text">' +
              Im.esc(n.text) +
              '</p><p class="notif-time">' +
              n.time +
              "</p></div></div>"
            );
          })
          .join("")
      : '<p class="notif-empty">Tidak ada notifikasi</p>';

    list.onclick = function (e) {
      var item = e.target.closest('[data-action="markRead"]');
      if (item) {
        var n = notifications.find(function (x) {
          return x.id === item.dataset.id;
        });
        if (n) {
          n.read = true;
          renderNotifs();
        }
      }
    };
  }

  function toggleNotif() {
    var p = el("notif-panel"),
      b = el("bell-btn");
    if (p) {
      var o = p.classList.toggle("open");
      if (b) b.setAttribute("aria-expanded", String(o));
    }
  }
  function closeNotifPanel() {
    var p = el("notif-panel"),
      b = el("bell-btn");
    if (p) {
      p.classList.remove("open");
      if (b) b.setAttribute("aria-expanded", "false");
    }
  }

  /* ── Init ──────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    S.init();
    el("today-date").textContent = Im.fmtFullDate();

    if (!isDonePage) {
      el("fab-btn").addEventListener("click", function () {
        M.open();
      });
      el("modal-close-btn").addEventListener("click", function () {
        M.close();
      });
      var mbg = el("modal-bg");
      if (mbg)
        mbg.addEventListener("click", function (e) {
          if (e.target === mbg) M.close();
        });
      el("modal-form").addEventListener("submit", function (e) {
        M.submit(e);
      });
      el("prio-group").addEventListener("click", function (e) {
        var b = e.target.closest("[data-prio]");
        if (b) M.setPrio(b.getAttribute("data-prio"));
      });
    }

    document.addEventListener("task:added", function () {
      render();
      renderNotifs();
    });

    if (el("priority-root"))
      el("priority-root").addEventListener("click", handleAction);
    if (el("done-content"))
      el("done-content").addEventListener("click", handleAction);

    function handleAction(e) {
      var row = e.target.closest("[data-id]");
      if (!row) return;
      var id = row.dataset.id;
      if (e.target.closest("[data-action='toggle']")) toggleTask(id);
      else if (e.target.closest("[data-action='delete']")) deleteTask(id);
    }

    if (el("delete-all-btn"))
      el("delete-all-btn").addEventListener("click", deleteAll);

    document.addEventListener("input", function (e) {
      if (e.target.id === "search-input") render(e.target.value);
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest("#bell-btn")) {
        toggleNotif();
        return;
      }
      if (!e.target.closest(".tb-bell-wrap")) closeNotifPanel();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeNotifPanel();
        if (M) M.close();
      }
    });
    document.addEventListener("topbar:loaded", renderNotifs);

    render();
  });
})();
