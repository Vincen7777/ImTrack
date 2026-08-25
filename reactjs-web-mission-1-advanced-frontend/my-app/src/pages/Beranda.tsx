import { useState, useContext, useCallback, useEffect } from 'react';
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
  const {
    tasks,
    loading,
    error,
    notifications,
    fetchTasks,
    toggleTask,
    deleteTask,
    sendToGroup,
    addTask,
    updateTask,
    markRead,
  } = useTaskStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayDate = useTodayDate();

  /* ── Fetch task saat komponen pertama kali mount ─────────── */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Task handlers ────────────────────────────────────────
  const handleToggle = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const next = task.status === 'done' ? 'todo' : 'done';
      const verb = next === 'done' ? '✅ Selesai' : '🔄 Dikembalikan';
      try {
        await toggleTask(id);
        toast?.(`${verb}: ${task.title}`);
      } catch {
        toast?.('❌ Gagal mengubah status tugas');
      }
    },
    [tasks, toggleTask, toast]
  );

  const handleDelete = useCallback(
    async (id: string, title: string) => {
      if (!window.confirm(`Hapus tugas "${title}"?`)) return;
      try {
        await deleteTask(id);
        toast?.('🗑️ Tugas dihapus');
      } catch {
        toast?.('❌ Gagal menghapus tugas');
      }
    },
    [deleteTask, toast]
  );

  const handleSendToGroup = useCallback(
    async (taskId: string, _groupId: string, groupName: string) => {
      try {
        await sendToGroup(taskId);
        toast?.(`↗️ Tugas dikirim ke ${groupName}`);
      } catch {
        toast?.('❌ Gagal mengirim tugas ke grup');
      }
    },
    [sendToGroup, toast]
  );

  const handleSaveTask = useCallback(
    async (task: Omit<Task, 'id' | 'status'>) => {
      if (editingTask) {
        try {
          await updateTask(editingTask.id, task);
          toast?.('✏️ Tugas diperbarui');
        } catch {
          toast?.('❌ Gagal memperbarui tugas');
        }
      } else {
        try {
          await addTask(task);
          toast?.('✅ Tugas ditambahkan');
        } catch {
          toast?.('❌ Gagal menambahkan tugas');
        }
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
              loading={loading}
              error={error}
              searchQuery={searchQuery}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSendToGroup={handleSendToGroup}
              onRetry={fetchTasks}
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
