/**
 * task-store.js — Data layer
 */
(function () {
  "use strict";
  var S = (window.ImTrack.store = {});
  var tasks = [];
  var KEY = "imtrack_tasks";

  S.init = function () {
    try {
      var r = localStorage.getItem(KEY);
      tasks = r ? JSON.parse(r) : [];
    } catch (e) {
      tasks = [];
    }
  };

  S.all = function () {
    return tasks;
  };

  S.add = function (text, priority, due) {
    var t = {
      id: "t" + Date.now(),
      text: text,
      priority: priority,
      dateAdded: new Date().toISOString().split("T")[0],
      due: due || null,
      status: "todo",
    };
    tasks.unshift(t);
    S.save();
    return t;
  };

  S.toggle = function (id) {
    var t = tasks.find(function (x) {
      return x.id === id;
    });
    if (t) {
      t.status = t.status === "todo" ? "done" : "todo";
      S.save();
    }
    return t;
  };
  S.remove = function (id) {
    var t = tasks.find(function (x) {
      return x.id === id;
    });
    if (t) {
      tasks = tasks.filter(function (x) {
        return x.id !== id;
      });
      S.save();
    }
    return t;
  };
  S.removeAll = function () {
    tasks = [];
    S.save();
  };
  S.save = function () {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  };

  S.filterByStatus = function (status, q) {
    q = (q || "").toLowerCase().trim();
    return tasks.filter(function (t) {
      return (
        t.status === status && (!q || t.text.toLowerCase().indexOf(q) !== -1)
      );
    });
  };
})();
