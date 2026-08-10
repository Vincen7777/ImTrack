import { useRef, useEffect } from 'react';
import type { Notification } from '../../types/task';

interface TopbarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  notifications: Notification[];
  notifOpen: boolean;
  onToggleNotif: () => void;
  onMarkRead: (id: string) => void;
}

function Topbar({
  searchValue,
  onSearchChange,
  notifications,
  notifOpen,
  onToggleNotif,
  onMarkRead,
}: TopbarProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close panel when clicking outside
  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        bellRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !bellRef.current.contains(e.target as Node)
      ) {
        onToggleNotif();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen, onToggleNotif]);

  return (
    <header id="app-topbar" className="topbar">
      {/* Search */}
      <div className="tb-search" role="search">
        <i className="ph ph-magnifying-glass" aria-hidden="true" />
        <input
          id="search-input"
          type="search"
          placeholder="Cari tugas..."
          aria-label="Cari tugas"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="tb-spacer" />

      {/* Bell + notif panel */}
      <div className="tb-bell-wrap">
        <button
          ref={bellRef}
          className="tb-icon-btn"
          id="bell-btn"
          aria-label="Notifikasi"
          aria-haspopup="true"
          aria-expanded={notifOpen}
          onClick={onToggleNotif}
        >
          <i className="ph ph-bell" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="tb-notif-dot" id="notif-dot" aria-hidden="true" />
          )}
        </button>

        {notifOpen && (
          <div
            ref={panelRef}
            className="notif-panel open"
            id="notif-panel"
            role="menu"
            aria-label="Panel notifikasi"
          >
            <p className="notif-head">Notifikasi</p>
            <div id="notif-list">
              {notifications.length === 0 ? (
                <p className="notif-empty">Tidak ada notifikasi</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="notif-item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => onMarkRead(n.id)}
                    onKeyDown={(e) => e.key === 'Enter' && onMarkRead(n.id)}
                  >
                    {!n.read ? (
                      <div className="notif-dot" aria-label="Belum dibaca" />
                    ) : (
                      <div className="notif-spacer" />
                    )}
                    <div>
                      <p className="notif-text">{n.text}</p>
                      <p className="notif-time">{n.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
