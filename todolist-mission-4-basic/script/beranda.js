import * as store from "./task-store.js";
import * as modal from "./task-modal.js";
import { fmtDate, fmtFullDate, toast } from "./app.js";

const isDonePage = window.location.pathname.includes("done");

const notifications = [
  {
    id: "n1",
    text: "Selamat datang di ImTrack! Mulai tambahkan tugasmu hari ini.",
    time: "Baru saja",
    read: false,
  },
];

const el = (id) => document.getElementById(id);
const todayStr = () => new Date().toISOString().split("T")[0];
const isOverdue = (t) => t.due && t.status !== "done" && t.due < todayStr();

const CFG = {
  High: {
    l: "Prioritas Tinggi",
    icon: "ph-fill ph-fire",
    ico: "#ef4444",
    bg: "#fef2f2",
    fg: "#b91c1c",
    badgeText: "Fokus Utama",
  },
  Medium: {
    l: "Prioritas Sedang",
    icon: "ph-fill ph-clock",
    ico: "#d97706",
    bg: "#fffbeb",
    fg: "#92400e",
    badgeText: null,
  },
  Low: {
    l: "Prioritas Rendah",
    icon: "ph-fill ph-feather",
    ico: "#3b82f6",
    bg: "#eff6ff",
    fg: "#1d4ed8",
    badgeText: null,
  },
};

const dateCell = (t) => fmtDate(t.due || t.dateAdded);

/* ── Template helpers ──────────────────────────────────── */
const tpl = (id) => document.getElementById(id).content.cloneNode(true);

function buildRow(t, { checked, showOverdue, doneClass }) {
  const frag = tpl("tpl-task-row");
  const tr = frag.querySelector("tr");
  tr.dataset.id = t.id;
  if (showOverdue) tr.classList.add("overdue-row");

  const cb = frag.querySelector(".task-cb");
  cb.checked = checked;
  if (checked) cb.classList.add("done-cb");

  const textEl = frag.querySelector('[data-slot="text"]');
  textEl.textContent = t.text;
  if (doneClass) textEl.classList.add("done");

  if (!showOverdue) frag.querySelector('[data-slot="overdue"]').remove();

  frag.querySelector('[data-slot="date"]').textContent = dateCell(t);
  return tr;
}

function emptyRow(text) {
  const frag = tpl("tpl-empty-row");
  frag.querySelector('[data-slot="text"]').textContent = text;
  return frag.querySelector("tr");
}

function buildRows(items, rowFn, emptyText) {
  const frag = document.createDocumentFragment();
  if (items.length) {
    items.forEach((t) => frag.appendChild(rowFn(t)));
  } else {
    frag.appendChild(emptyRow(emptyText));
  }
  return frag;
}

function buildSection({ label, icon, iconColor, bg, fg, badgeText, count, rows }) {
  const frag = tpl("tpl-prio-section");

  const head = frag.querySelector(".prio-head");
  head.style.background = bg;
  head.style.color = fg;

  const iconEl = frag.querySelector('[data-slot="icon"]');
  iconEl.className = icon;
  iconEl.style.color = iconColor;

  frag.querySelector('[data-slot="label"]').textContent = label;

  const badgeEl = frag.querySelector('[data-slot="badge"]');
  if (badgeText) {
    badgeEl.textContent = badgeText;
    badgeEl.style.background = "#fef2f2";
    badgeEl.style.color = "#ef4444";
  } else {
    badgeEl.remove();
  }

  frag.querySelector('[data-slot="count"]').textContent = count;
  frag.querySelector("tbody").appendChild(rows);

  return frag;
}

/* ── Render ────────────────────────────────────────────── */
function render(filter = "") {
  filter = filter.toLowerCase().trim();
  renderTodos(filter);
  renderDones(filter);
  const delAll = el("delete-all-btn");
  if (delAll) delAll.style.display = store.all().length ? "inline-flex" : "none";
}

function renderTodos(filter) {
  const root = el("priority-root");
  if (!root) return;
  const todos = store
    .filterByStatus("todo", filter)
    .sort((a, b) => isOverdue(b) - isOverdue(a));

  root.innerHTML = "";
  const frag = document.createDocumentFragment();

  ["High", "Medium", "Low"].forEach((prio) => {
    const pts = todos.filter((t) => t.priority === prio);
    const cfg = CFG[prio];
    frag.appendChild(
      buildSection({
        label: cfg.l,
        icon: cfg.icon,
        iconColor: cfg.ico,
        bg: cfg.bg,
        fg: cfg.fg,
        badgeText: cfg.badgeText,
        count: pts.length,
        rows: buildRows(pts, todoRow, "Tidak ada tugas"),
      })
    );
  });

  root.appendChild(frag);
}

function todoRow(t) {
  return buildRow(t, { checked: false, showOverdue: isOverdue(t), doneClass: false });
}

function renderDones(filter) {
  const root = el("done-content");
  if (!root) return;
  const dones = store.filterByStatus("done", filter);

  root.innerHTML = "";
  root.appendChild(
    buildSection({
      label: "Done (Selesai)",
      icon: "ph-fill ph-check-circle",
      iconColor: "#10b981",
      bg: "#ecfdf5",
      fg: "#065f46",
      badgeText: null,
      count: dones.length,
      rows: buildRows(dones, doneRow, "Belum ada tugas yang diselesaikan"),
    })
  );
}

function doneRow(t) {
  return buildRow(t, { checked: true, showOverdue: false, doneClass: true });
}

/* ── Actions ───────────────────────────────────────────── */
function toggleTask(id) {
  const t = store.toggle(id);
  if (t) {
    render();
    toast(t.status === "done" ? "Selesai!" : "Dikembalikan");
  }
}

function deleteTask(id) {
  if (store.remove(id)) {
    render();
    toast("Tugas dihapus");
  }
}

function deleteAll() {
  if (!store.all().length) return;
  if (!confirm("Hapus semua tugas?")) return;
  store.removeAll();
  render();
  toast("Semua tugas dihapus");
}

/* ── Notifications ─────────────────────────────────────── */
function renderNotifs() {
  const unread = notifications.filter((n) => !n.read).length;
  const dot = el("notif-dot");
  if (dot) dot.style.display = unread > 0 ? "block" : "none";

  const list = el("notif-list");
  if (!list) return;

  list.innerHTML = "";
  if (notifications.length) {
    const frag = document.createDocumentFragment();
    notifications.forEach((n) => frag.appendChild(buildNotifItem(n)));
    list.appendChild(frag);
  } else {
    const empty = document.createElement("p");
    empty.className = "notif-empty";
    empty.textContent = "Tidak ada notifikasi";
    list.appendChild(empty);
  }

  list.onclick = (e) => {
    const item = e.target.closest('[data-action="markRead"]');
    if (item) {
      const n = notifications.find((x) => x.id === item.dataset.id);
      if (n) {
        n.read = true;
        renderNotifs();
      }
    }
  };
}

function buildNotifItem(n) {
  const frag = tpl("tpl-notif-item");
  const wrap = frag.querySelector(".notif-item");
  wrap.dataset.id = n.id;

  const indicator = frag.querySelector('[data-slot="indicator"]');
  indicator.className = n.read ? "notif-spacer" : "notif-dot";

  frag.querySelector('[data-slot="text"]').textContent = n.text;
  frag.querySelector('[data-slot="time"]').textContent = n.time;

  return wrap;
}

function toggleNotif() {
  const p = el("notif-panel");
  const b = el("bell-btn");
  if (p) {
    const o = p.classList.toggle("open");
    if (b) b.setAttribute("aria-expanded", String(o));
  }
}

function closeNotifPanel() {
  const p = el("notif-panel");
  const b = el("bell-btn");
  if (p) {
    p.classList.remove("open");
    if (b) b.setAttribute("aria-expanded", "false");
  }
}

/* ── Init ──────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  store.init();
  el("today-date").textContent = fmtFullDate();

  if (!isDonePage) {
    el("fab-btn").addEventListener("click", () => modal.open());
    el("modal-close-btn").addEventListener("click", () => modal.close());
    const mbg = el("modal-bg");
    if (mbg)
      mbg.addEventListener("click", (e) => {
        if (e.target === mbg) modal.close();
      });
    el("modal-form").addEventListener("submit", (e) => modal.submit(e));
    el("prio-group").addEventListener("click", (e) => {
      const b = e.target.closest("[data-prio]");
      if (b) modal.setPrio(b.getAttribute("data-prio"));
    });
  }

  document.addEventListener("task:added", () => {
    render();
    renderNotifs();
  });

  if (el("priority-root")) el("priority-root").addEventListener("click", handleAction);
  if (el("done-content")) el("done-content").addEventListener("click", handleAction);

  function handleAction(e) {
    const row = e.target.closest("[data-id]");
    if (!row) return;
    const id = row.dataset.id;
    if (e.target.closest("[data-action='toggle']")) toggleTask(id);
    else if (e.target.closest("[data-action='delete']")) deleteTask(id);
  }

  if (el("delete-all-btn")) el("delete-all-btn").addEventListener("click", deleteAll);

  document.addEventListener("input", (e) => {
    if (e.target.id === "search-input") render(e.target.value);
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("#bell-btn")) {
      toggleNotif();
      return;
    }
    if (!e.target.closest(".tb-bell-wrap")) closeNotifPanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNotifPanel();
      modal.close();
    }
  });

  document.addEventListener("topbar:loaded", renderNotifs);

  render();
});