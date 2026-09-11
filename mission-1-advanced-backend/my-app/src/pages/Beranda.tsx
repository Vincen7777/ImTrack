import { useState, useContext, useCallback, useEffect } from 'react';
import { ToastContext } from '../components/common/ToastContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import BottomNav from '../components/layout/BottomNav';
import TodayPriorityList from '../components/beranda/TodayPriorityList';
import QuickAddModal from '../components/beranda/QuickAddModal';
import { useTaskRedux } from '../hooks/useTaskRedux';
import { useTodayDate } from '../utils/berandaUtils';
import type { Task } from '../types/task';
import { useMemo } from 'react';
import type { TaskQuery } from '../services/api/taskApi';
import ProfileAvatar from '../components/auth/ProfileAvatar';
import { useAuth } from '../components/auth/AuthContext';

function Beranda() {
  const { signOut } = useAuth();
  const toast = useContext(ToastContext);
  const {
    tasks,
    loading,
    error,
    notifications,
    fetchTasks,
    toggleTask,
    deleteTask,
    addTask,
    updateTask,
    markRead,
  } = useTaskRedux();

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const query = useMemo<TaskQuery>(() => {
    const [field, order] = sort.split(':');
    return { ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}), ...(category ? { cat: category } : {}),
      ...(status ? { status: status as Task['status'] } : {}), ...(priority ? { priority: priority as Task['priority'] } : {}),
      sort: field as TaskQuery['sort'], order: order as TaskQuery['order'] };
  }, [searchQuery, category, status, priority, sort]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayDate = useTodayDate();

  /* ── Fetch task saat komponen pertama kali mount ─────────── */
  useEffect(() => {
    let request: ReturnType<typeof fetchTasks> | undefined;
    const timer = window.setTimeout(() => { request = fetchTasks(query); }, 250);
    return () => { window.clearTimeout(timer); request?.abort(); };
  }, [fetchTasks, query]);

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
        void taskId;
        toast?.(`Fitur berbagi ke ${groupName} belum tersedia.`);
      } catch {
        toast?.('❌ Gagal mengirim tugas ke grup');
      }
    },
    [toast]
  );

  const handleSaveTask = useCallback(
    async (task: Omit<Task, 'id' | 'status'>) => {
      if (editingTask) {
        try {
          await updateTask(editingTask.id, task);
          toast?.('✏️ Tugas diperbarui');
        } catch (error) {
          toast?.('❌ Gagal memperbarui tugas');
          throw error;
        }
      } else {
        try {
          await addTask(task);
          toast?.('✅ Tugas ditambahkan');
        } catch (error) {
          toast?.('❌ Gagal menambahkan tugas');
          throw error;
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
      <Sidebar onNotImpl={handleNotImpl} onCategoryChange={setCategory} />

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
          <details className="mobile-account"><summary>Akun saya</summary><ProfileAvatar /><button className="btn" onClick={signOut}>Keluar</button></details>
          {/* Page header */}
          <header className="page-hd">
            <h1>Tugas Saya</h1>
            <p className="page-date" id="today-date">
              {todayDate}
            </p>
          </header>
          <div className="task-filters" aria-label="Filter dan urutan tugas">
            <label>Kategori<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Semua kategori</option><option value="pekerjaan">Pekerjaan</option><option value="pribadi">Pribadi</option><option value="Belajar">Belajar</option></select></label>
            <label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua status</option><option value="todo">Belum selesai</option><option value="done">Selesai</option></select></label>
            <label>Prioritas<select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">Semua prioritas</option>{['Sekarang', 'Nanti', 'Someday'].map((p) => <option key={p}>{p}</option>)}</select></label>
            <label>Urutan dalam prioritas<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="createdAt:desc">Terbaru</option><option value="createdAt:asc">Terlama</option><option value="title:asc">Judul A–Z</option><option value="title:desc">Judul Z–A</option><option value="due:asc">Tenggat terdekat</option></select></label>
          </div>

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
              onRetry={() => { fetchTasks(query); }}
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
