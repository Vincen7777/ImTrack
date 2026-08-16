import { useState, useContext, useCallback } from 'react';
import { ToastContext } from '../components/common/ToastProvider';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import BottomNav from '../components/layout/BottomNav';
import TodayPriorityList from '../components/beranda/TodayPriorityList';
import QuickAddModal from '../components/beranda/QuickAddModal';
import { useTaskStore } from '../hooks/useTaskStore';
import { useTodayDate } from '../utils/berandaUtils';
import type { Task } from '../types/task';

function Beranda() {
  const toast = useContext(ToastContext);
  const { tasks, notifications, toggleTask, deleteTask, sendToGroup, addTask, updateTask, markRead } =
    useTaskStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayDate = useTodayDate();

  // ── Task handlers ────────────────────────────────────────
  const handleToggle = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      toggleTask(id);
      const next = task.status === 'done' ? 'todo' : 'done';
      const verb = next === 'done' ? '✅ Selesai' : '🔄 Dikembalikan';
      toast?.(`${verb}: ${task.title}`);
    },
    [tasks, toggleTask, toast]
  );

  const handleDelete = useCallback(
    (id: string, title: string) => {
      if (!window.confirm(`Hapus tugas "${title}"?`)) return;
      deleteTask(id);
      toast?.('🗑️ Tugas dihapus');
    },
    [deleteTask, toast]
  );

  const handleSendToGroup = useCallback(
    (taskId: string, _groupId: string, groupName: string) => {
      sendToGroup(taskId);
      toast?.(`↗️ Tugas dikirim ke ${groupName}`);
    },
    [sendToGroup, toast]
  );

  const handleSaveTask = useCallback(
    (task: Omit<Task, 'id' | 'status'>) => {
      if (editingTask) {
        updateTask(editingTask.id, task);
        toast?.('✏️ Tugas diperbarui');
      } else {
        addTask(task);
        toast?.('✅ Tugas ditambahkan');
      }
      setEditingTask(null);
    },
    [addTask, editingTask, toast, updateTask]
  );

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingTask(null);
  }, []);

  // ── Sidebar "not implemented" handler ────────────────────
  const handleNotImpl = useCallback(
    (name: string) => {
      toast?.(`🚧 "${name}" belum tersedia`);
    },
    [toast]
  );

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar onNotImpl={handleNotImpl} />

      {/* Main */}
      <main className="app-main">
        {/* Topbar */}
        <Topbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          notifOpen={notifOpen}
          onToggleNotif={() => setNotifOpen((o) => !o)}
          onMarkRead={markRead}
        />

        {/* Page content */}
        <div className="app-content">
          {/* Page header */}
          <header className="page-hd">
            <h1>Hari Ini</h1>
            <p className="page-date" id="today-date">
              {todayDate}
            </p>
          </header>

          {/* Task sections */}
          <section
            className="sections"
            id="priority-root"
            aria-label="Daftar tugas hari ini"
          >
            <TodayPriorityList
              tasks={tasks}
              searchQuery={searchQuery}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSendToGroup={handleSendToGroup}
            />
          </section>
        </div>
      </main>

      {/* Bottom Nav (mobile only) */}
      <BottomNav onNotImpl={handleNotImpl} />

      {/* FAB */}
      <button
        className="fab"
        id="fab"
        onClick={() => {
          setEditingTask(null);
          setModalOpen(true);
        }}
        aria-label="Tambah tugas baru"
        title="Tambah Tugas"
      >
        <i className="ph ph-plus" aria-hidden="true" />
      </button>

      {/* Quick Add Modal */}
      {modalOpen && (
        <QuickAddModal
          key={editingTask?.id ?? 'new-task'}
          open={modalOpen}
          editingTask={editingTask}
          onClose={handleCloseModal}
          onSubmit={handleSaveTask}
        />
      )}
    </div>
  );
}

export default Beranda;
