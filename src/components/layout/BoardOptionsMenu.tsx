import { useRef, useState } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import iconEllipsis from '@assets/icon-vertical-ellipsis.svg';

type BoardOptionsMenuProps = {
  onEditBoard?: () => void;
  onDeleteBoard?: () => void;
  canEditBoard?: boolean;
};

export function BoardOptionsMenu({
  onEditBoard,
  onDeleteBoard,
  canEditBoard = false,
}: BoardOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  return (
    <div ref={menuRef} className="app-board-options-menu">
      <button
        type="button"
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((o) => !o)}
        className="app-icon-btn"
      >
        <img src={iconEllipsis} alt="" width={5} height={20} />
      </button>
      {isOpen && canEditBoard && (
        <div role="menu" className="app-board-options-menu-panel">
          <button
            type="button"
            role="menuitem"
            className="app-popover-menu-item"
            onClick={() => {
              onEditBoard?.();
              setIsOpen(false);
            }}
          >
            Edit Board
          </button>
          <button
            type="button"
            role="menuitem"
            className="app-popover-menu-item app-popover-menu-item-destructive"
            onClick={() => {
              onDeleteBoard?.();
              setIsOpen(false);
            }}
          >
            Delete Board
          </button>
        </div>
      )}
    </div>
  );
}
