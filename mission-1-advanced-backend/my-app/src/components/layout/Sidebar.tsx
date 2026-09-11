import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ProfileAvatar from '../auth/ProfileAvatar';

const GROUPS = [
  { id: 'g1', name: 'Tim Marketing' },
  { id: 'g2', name: 'Project Alpha' },
];

interface SidebarProps {
  onNotImpl?: (name: string) => void;
  onCategoryChange: (category: string) => void;
}

function Sidebar({ onNotImpl, onCategoryChange }: SidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  function handleSignOut() {
    signOut();
    navigate('/sign-in');
  }

  return (
    <aside id="app-sidebar" className="sidebar" aria-label="Navigasi aplikasi">
      {/* Logo */}
      <div className="sb-logo">
        <img src="/logo.svg" alt="logo ImTrack" width={32} height={32} />
        <span className="sb-logo-text">ImTrack</span>
      </div>

      {/* Nav */}
      <nav className="sb-nav" aria-label="Menu utama">
        <Link to="/beranda" className="sb-item active" aria-current="page">
          <i className="ph ph-list-checks" aria-hidden="true" /> Tugas Saya
        </Link>

        <button
          className="sb-item"
          onClick={() => onNotImpl?.('Board')}
        >
          <i className="ph ph-kanban" aria-hidden="true" /> Board
        </button>

        <button
          className="sb-item"
          onClick={() => onNotImpl?.('Kalender')}
        >
          <i className="ph ph-calendar" aria-hidden="true" /> Kalender
        </button>

        {/* Collaborative list section */}
        <div className="sb-section">
          <span>List Kolaboratif</span>
          <button
            onClick={() => onNotImpl?.('Buat grup baru')}
            aria-label="Buat grup baru"
          >
            <i className="ph ph-plus-circle" aria-hidden="true" />
          </button>
        </div>

        {GROUPS.map((g) => (
          <a
            key={g.id}
            href="#"
            className="sb-sub"
            onClick={(e) => {
              e.preventDefault();
              onNotImpl?.(g.name);
            }}
          >
            <i className="ph ph-users-three" aria-hidden="true" /> {g.name}
          </a>
        ))}

        {/* Kategori section */}
        <div className="sb-section">
          <span>Kategori</span>
          <button
            onClick={() => onNotImpl?.('Buat kategori baru')}
            aria-label="Buat kategori baru"
          >
            <i className="ph ph-plus-circle" aria-hidden="true" />
          </button>
        </div>

        {['Semua', 'Pekerjaan', 'Pribadi'].map((cat) => (
          <a
            key={cat}
            href="#"
            className="sb-sub"
            onClick={(e) => {
              e.preventDefault();
              onCategoryChange(cat === 'Semua' ? '' : cat.toLowerCase());
            }}
          >
            <i
              className={`ph ${cat === 'Semua' ? 'ph-folder' : 'ph-folder-simple'}`}
              aria-hidden="true"
            />{' '}
            {cat}
          </a>
        ))}

        {/* Locked modules */}
        <div className="sb-section sb-section-locked">
          <span>Modul Terkunci</span>
        </div>

        <div className="sb-locked" title="Akan hadir di Fase 4">
          <span>
            <i className="ph ph-wallet" aria-hidden="true" /> Keuangan
          </span>
          <i className="ph ph-lock" aria-hidden="true" />
        </div>

        <div className="sb-locked" title="Akan hadir di Fase 4">
          <span>
            <i className="ph ph-heartbeat" aria-hidden="true" /> Kesehatan
          </span>
          <i className="ph ph-lock" aria-hidden="true" />
        </div>
      </nav>

      {/* Footer */}
      <div className="sb-footer">
        <ProfileAvatar />
        <button className="sb-logout" onClick={handleSignOut}>
          <i className="ph ph-sign-out" aria-hidden="true" /> Keluar
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
