/**
 * task-modal.js — Modal logic
 */
(function () {
  "use strict";
  var Im = window.ImTrack;
  var M = (Im.modal = {});
  var state = { priority: "Medium" };

  M.open = function () {
    document.getElementById("m-title").value = "";
    document.getElementById("m-due").value = "";
    document.getElementById("m-err").classList.remove("on");
    document.getElementById("m-submit").disabled = false;
    document.getElementById("m-submit").textContent = "Tambah Tugas";
    state = { priority: "Medium" };

    document.querySelectorAll("#prio-group .prio-btn").forEach(function (b) {
      var p = b.getAttribute("data-prio");
      b.className =
        "prio-btn prio-" + p.toLowerCase() + (p === "Medium" ? " on" : " off");
    });

    document.getElementById("modal-bg").classList.add("open");
    setTimeout(function () {
      document.getElementById("m-title").focus();
    }, 120);
  };

  M.close = function () {
    var bg = document.getElementById("modal-bg");
    if (bg) bg.classList.remove("open");
  };

  M.setPrio = function (p) {
    state.priority = p;
    document.querySelectorAll("#prio-group .prio-btn").forEach(function (b) {
      var bp = b.getAttribute("data-prio");
      b.className =
        "prio-btn prio-" + bp.toLowerCase() + (bp === p ? " on" : " off");
    });
  };

  M.submit = function (e) {
    e.preventDefault();
    Im.clearErr("m-err");
    var text = document.getElementById("m-title").value.trim();
    if (!text) {
      Im.showErr("m-err", "Tugas tidak boleh kosong.");
      return;
    }

    document.getElementById("m-submit").disabled = true;
    document.getElementById("m-submit").textContent = "Menambah...";

    var due = document.getElementById("m-due").value || null;
    var task = Im.store.add(text, state.priority, due);
    M.close();
    document.dispatchEvent(new CustomEvent("task:added", { detail: task }));
  };
})();
