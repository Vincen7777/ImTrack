const KEY = "imtrack_tasks";
let tasks = [];

export function init() {
  try {
    const r = localStorage.getItem(KEY);
    tasks = r ? JSON.parse(r) : [];
  } catch (e) {
    tasks = [];
  }
}

export function all() {
  return tasks;
}

export function add(text, priority, due) {
  const t = {
    id: `t${Date.now()}`,
    text,
    priority,
    dateAdded: new Date().toISOString().split("T")[0],
    due: due || null,
    status: "todo",
  };
  tasks.unshift(t);
  save();
  return t;
}

export function toggle(id) {
  const t = tasks.find((x) => x.id === id);
  if (t) {
    t.status = t.status === "todo" ? "done" : "todo";
    save();
  }
  return t;
}

export function remove(id) {
  const t = tasks.find((x) => x.id === id);
  if (t) {
    tasks = tasks.filter((x) => x.id !== id);
    save();
  }
  return t;
}

export function removeAll() {
  tasks = [];
  save();
}

export function save() {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function filterByStatus(status, q) {
  q = (q || "").toLowerCase().trim();
  return tasks.filter(
    (t) => t.status === status && (!q || t.text.toLowerCase().includes(q))
  );
}