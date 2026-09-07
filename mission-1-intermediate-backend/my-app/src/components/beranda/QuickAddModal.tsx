import { useState, useEffect, useRef, useCallback } from 'react';
import type { Priority, Task } from '../../types/task';

interface QuickAddModalProps {
  open: boolean;
  editingTask?: Task | null;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'status'>) => void;
}

type RecurrenceType = 'daily' | 'weekly' | 'monthly';

function QuickAddModal({ open, editingTask = null, onClose, onSubmit }: QuickAddModalProps) {
  const [title, setTitle] = useState(() => editingTask?.title ?? '');
  const [priority, setPriority] = useState<Priority>(() => editingTask?.priority ?? 'Nanti');
  const [due, setDue] = useState(() => editingTask?.due ?? '');
  const [tags, setTags] = useState(() => editingTask?.tags.join(' ') ?? '');
  const [catId, setCatId] = useState(() => editingTask?.cat ?? '');
  const [isRecurring, setIsRecurring] = useState(() => editingTask?.isRecurring ?? false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    () => editingTask?.recurrenceType ?? 'daily'
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // The component is mounted only while the modal is open, so its initial state
  // can be derived from the task being edited without resetting state in an effect.
  useEffect(() => {
    const timer = setTimeout(() => titleRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      const trimmed = title.trim();
      if (!trimmed) {
        setError('Judul tugas wajib diisi.');
        return;
      }
      setSubmitting(true);
      const parsedTags = tags.trim().split(/\s+/).filter((t) => t.startsWith('#'));
      onSubmit({
        title: trimmed,
        priority,
        due: due || null,
        tags: parsedTags,
        cat: catId || 'pribadi',
        isRecurring,
        recurrenceType,
      });
      onClose();
    },
    [title, priority, due, tags, catId, isRecurring, recurrenceType, onSubmit, onClose]
  );

  function handleBgClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === bgRef.current) onClose();
  }

  if (!open) return null;

  const CATEGORIES = [
    { id: '', label: 'Tanpa kategori', icon: null },
    { id: 'pekerjaan', label: 'Pekerjaan', icon: 'ph-folder-simple' },
    { id: 'pribadi', label: 'Pribadi', icon: 'ph-folder-simple' },
  ];

  const RECURRENCES: { id: RecurrenceType; label: string }[] = [
    { id: 'daily', label: 'Harian' },
    { id: 'weekly', label: 'Mingguan' },
    { id: 'monthly', label: 'Bulanan' },
  ];

  const PRIORITIES: { id: Priority; cls: string }[] = [
    { id: 'Sekarang', cls: 'prio-sekarang' },
    { id: 'Nanti', cls: 'prio-nanti' },
    { id: 'Someday', cls: 'prio-someday' },
  ];

  return (
    <div
      ref={bgRef}
      className="modal-backdrop open"
      id="modal-bg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBgClick}
    >
      <div className="modal-box" id="modal-box">
        {/* Header */}
        <div className="modal-head">
          <h2 className="modal-title" id="modal-title">
            {editingTask ? 'Edit Tugas' : 'Tambah Tugas'}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <i className="ph ph-x" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form
          className="modal-form"
          id="quick-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Judul */}
          <div className="form-group">
            <label className="form-label" htmlFor="m-title">
              Judul Tugas
            </label>
            <input
              ref={titleRef}
              id="m-title"
              type="text"
              className="form-input"
              placeholder="Apa yang perlu dikerjakan?"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Prioritas */}
          <div className="form-group">
            <label className="form-label" id="prio-label">
              Prioritas
            </label>
            <div
              className="prio-group"
              role="group"
              aria-labelledby="prio-label"
            >
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`prio-btn ${p.cls} ${priority === p.id ? 'on' : 'off'}`}
                  onClick={() => setPriority(p.id)}
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>

          {/* Tenggat */}
          <div className="form-group">
            <label className="form-label" htmlFor="m-due">
              Tenggat (opsional)
            </label>
            <input
              id="m-due"
              type="date"
              className="form-input"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>

          {/* Tugas Berulang */}
          <div className="form-group">
            <div className="check-row">
              <input
                type="checkbox"
                id="m-recur"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <label htmlFor="m-recur">
                Tugas Berulang{' '}
                <i className="ph ph-repeat recur-icon" aria-hidden="true" />
              </label>
            </div>
            {isRecurring && (
              <div className="recur-opts" id="recur-opts">
                {RECURRENCES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`chip ${recurrenceType === r.id ? 'on' : ''}`}
                    data-r={r.id}
                    onClick={() => setRecurrenceType(r.id)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Label / Tag */}
          <div className="form-group">
            <label className="form-label" htmlFor="m-tags">
              Label / Tag (opsional)
            </label>
            <input
              id="m-tags"
              type="text"
              className="form-input"
              placeholder="#urgent #design #client"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="file-hint">Pisahkan dengan spasi: #urgent #design</p>
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label className="form-label" id="cat-label">
              Kategori
            </label>
            <div
              className="chip-group"
              id="cat-group"
              role="group"
              aria-labelledby="cat-label"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`chip ${catId === c.id ? 'on' : ''}`}
                  data-c={c.id}
                  onClick={() => setCatId(c.id)}
                >
                  {c.icon && (
                    <i className={`ph ${c.icon}`} aria-hidden="true" />
                  )}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p id="m-err" className="err on" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            id="m-submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? 'Menyimpan...' : editingTask ? 'Simpan Perubahan' : 'Tambah Tugas'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuickAddModal;
