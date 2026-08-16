import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
  onNotImpl?: (name: string) => void;
}

const NAV_ITEMS = [
  { icon: 'ph-calendar-blank', label: 'Hari Ini', to: '/beranda' },
  { icon: 'ph-list-checks', label: 'Tugas', to: null, key: 'Tugas Saya' },
  { icon: 'ph-kanban', label: 'Board', to: null, key: 'Board' },
  { icon: 'ph-calendar', label: 'Kalender', to: null, key: 'Kalender' },
];

function BottomNav({ onNotImpl }: BottomNavProps) {
  const { pathname } = useLocation();

  return (
    <nav id="bottom-nav" className="bottom-nav" aria-label="Navigasi bawah">
      {NAV_ITEMS.map((item) => {
        const isActive = item.to ? pathname === item.to : false;

        if (item.to) {
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`bn-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <i className={`ph ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <button
            key={item.label}
            className="bn-item"
            onClick={() => onNotImpl?.(item.key ?? item.label)}
          >
            <i className={`ph ${item.icon}`} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
