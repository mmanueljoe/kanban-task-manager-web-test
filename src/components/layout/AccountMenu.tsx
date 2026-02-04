import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useClickOutside } from '@/hooks/useClickOutside';

export function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  const handleLogout = () => {
    logout();
    void navigate('/login', { replace: true });
  };

  const userInitial =
    user?.name?.trim()?.charAt(0).toUpperCase() ??
    user?.email?.trim()?.charAt(0).toUpperCase() ??
    'A';

  return (
    <div ref={menuRef} className="app-account-menu">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
        className="app-account-menu-trigger"
      >
        {userInitial}
      </button>
      {isOpen && (
        <div role="menu" className="app-account-menu-panel">
          <button
            type="button"
            role="menuitem"
            className="app-popover-menu-item"
            onClick={() => {
              setIsOpen(false);
              void navigate('/admin');
            }}
          >
            Admin
          </button>
          <button
            type="button"
            role="menuitem"
            className="app-popover-menu-item app-popover-menu-item-destructive"
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
