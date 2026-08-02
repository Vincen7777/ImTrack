import { clearErr, showErr } from "./app.js";
import { add } from "./task-store.js";

let state = { priority: "Medium" };

export function open() {
  document.getElementById("m-title").value = "";
  document.getElementById("m-due").value = "";
  document.getElementById("m-err").classList.remove("on");
  document.getElementById("m-submit").disabled = false;
  document.getElementById("m-submit").textContent = "Tambah Tugas";
  state = { priority: "Medium" };

  document.querySelectorAll("#prio-group .prio-btn").forEach((b) => {
    const p = b.getAttribute("data-prio");
    b.className = `prio-btn prio-${p.toLowerCase()}${p === "Medium" ? " on" : " off"}`;
  });

  document.getElementById("modal-bg").classList.add("open");
  setTimeout(() => {
    document.getElementById("m-title").focus();
  }, 120);
}

export function close() {
  const bg = document.getElementById("modal-bg");
  if (bg) bg.classList.remove("open");
}

export function setPrio(p) {
  state.priority = p;
  document.querySelectorAll("#prio-group .prio-btn").forEach((b) => {
    const bp = b.getAttribute("data-prio");
    b.className = `prio-btn prio-${bp.toLowerCase()}${bp === p ? " on" : " off"}`;
  });
}

export function submit(e) {
  e.preventDefault();
  clearErr("m-err");
  const text = document.getElementById("m-title").value.trim();
  if (!text) {
    showErr("m-err", "Tugas tidak boleh kosong.");
    return;
  }

  document.getElementById("m-submit").disabled = true;
  document.getElementById("m-submit").textContent = "Menambah...";

  const due = document.getElementById("m-due").value || null;
  const task = add(text, state.priority, due);
  close();
  document.dispatchEvent(new CustomEvent("task:added", { detail: task }));
}