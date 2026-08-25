import { useState, useRef } from 'react';
import type { Task, Group } from '../../types/task';
import { PRIO_CFG, PRIORITIES, fmtDate } from '../../utils/berandaUtils';

const GROUPS: Group[] = [
  { id: 'g1', name: 'Tim Marketing' },
  { id: 'g2', name: 'Project Alpha' },
];

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string, title: string) => void;
  onSendToGroup: (taskId: string, groupId: string, groupName: string) => void;
}

function TaskItem({ task, onToggle, onEdit, onDelete, onSendToGroup }: TaskItemProps) {
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const cfg = PRIO_CFG[task.priority];
  const isDone = task.status === 'done';

  return (
    <div className="task-item" data-taskid={task.id}>
      <input
        type="checkbox"
        className={`task-cb ${cfg.cbCls}`}
        checked={isDone}
        aria-label="Tandai selesai"
        onChange={() => onToggle(task.id)}
      />
      <span className={`task-text ${isDone ? 'done' : ''}`}>
        {task.title}
        {task.due && (
          <span className="task-due">{fmtDate(task.due)}</span>
        )}
      </span>
      <div className="task-actions">
        <div className="dd-wrap" ref={ddRef}>
          <button
            className="task-action"
            aria-label="Opsi tugas"
            onClick={() => setDdOpen((o) => !o)}
          >
            <i className="ph ph-dots-three-outline" aria-hidden="true" />
          </button>
          {ddOpen && (
            <div className="dd-menu open" role="menu">
              <p className="dd-label">Kirim ke Grup</p>
              {GROUPS.map((g) => (
                <button
                  key={g.id}
                  className="dd-item"
                  onClick={() => {
                    setDdOpen(false);
                    onSendToGroup(task.id, g.id, g.name);
                  }}
                >
                  <i className="ph ph-share" aria-hidden="true" /> {g.name}
                </button>
              ))}
              <p className="dd-label">Aksi</p>
              <button
                className="dd-item"
                onClick={() => {
                  setDdOpen(false);
                  onEdit(task);
                }}
              >
                <i className="ph ph-pencil-simple" aria-hidden="true" /> Edit
              </button>
              <button
                className="dd-item"
                onClick={() => {
                  setDdOpen(false);
                  onDelete(task.id, task.title);
                }}
              >
                <i className="ph ph-trash" aria-hidden="true" /> Hapus
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Loading Skeleton ──────────────────────────────────────── */
function TaskSkeleton() {
  return (
    <div className="task-item" aria-busy="true" aria-label="Memuat tugas...">
      <div className="skeleton skeleton-cb" />
      <div className="skeleton skeleton-text" />
    </div>
  );
}

interface TodayPriorityListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string, title: string) => void;
  onSendToGroup: (taskId: string, groupId: string, groupName: string) => void;
  onRetry: () => void;
}

function TodayPriorityList({
  tasks,
  loading,
  error,
  searchQuery,
  onToggle,
  onEdit,
  onDelete,
  onSendToGroup,
  onRetry,
}: TodayPriorityListProps) {
  /* ── Loading State ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="prio-section s" role="region" aria-label="Memuat tugas">
        <div className="prio-head s">
          <span className="prio-head-label">
            <div className="skeleton skeleton-icon" />
            <div className="skeleton skeleton-label" />
          </span>
        </div>
        <div className="prio-body">
          {Array.from({ length: 3 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error State ───────────────────────────────────────── */
  if (error) {
    return (
      <div className="empty" role="alert">
        <i className="ph ph-warning-circle" aria-hidden="true" style={{ color: 'var(--red-500)' }} />
        <p style={{ color: 'var(--red-500)', fontWeight: 600 }}>{error}</p>
        <button
          className="btn btn-primary"
          onClick={onRetry}
          style={{ marginTop: '0.75rem' }}
        >
          <i className="ph ph-arrow-clockwise" aria-hidden="true" /> Coba Lagi
        </button>
      </div>
    );
  }

  /* ── Normal / Filter State ─────────────────────────────── */
  const q = searchQuery.toLowerCase().trim();
  const visible = q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : tasks;

  const sections = PRIORITIES.map((priority) => {
    const pts = visible.filter((t) => t.priority === priority);
    return { priority, pts, cfg: PRIO_CFG[priority] };
  }).filter(({ pts }) => pts.length > 0);

  if (sections.length === 0) {
    return (
      <div className="empty">
        <i className="ph ph-check-circle" aria-hidden="true" />
        <p>{q ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas'}</p>
        <p>
          {q
            ? 'Coba kata kunci lain'
            : 'Tekan tombol + untuk menambah tugas baru'}
        </p>
      </div>
    );
  }

  return (
    <>
      {sections.map(({ priority, pts, cfg }) => (
        <div
          key={priority}
          className={`prio-section ${cfg.secCls}`}
          role="region"
          aria-label={cfg.label}
        >
          <div className={`prio-head ${cfg.headCls}`}>
            <span className="prio-head-label">
              <i
                className={cfg.icon}
                style={{ color: cfg.iconColor }}
                aria-hidden="true"
              />
              {cfg.label}
            </span>
            {cfg.badge && (
              <span
                className="prio-badge"
                style={{
                  background: cfg.badgeBg,
                  color: cfg.badgeColor,
                }}
              >
                {cfg.badge}
              </span>
            )}
          </div>
          <div className="prio-body">
            {pts.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onSendToGroup={onSendToGroup}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default TodayPriorityList;
