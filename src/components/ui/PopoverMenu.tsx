import { useRef, useState, type ReactNode } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

type PopoverMenuProps = {
  trigger: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  align?: 'left' | 'right';
};

type PopoverMenuItemProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
};

export function PopoverMenu({
  trigger,
  children,
  ariaLabel = 'Menu',
  className = '',
  align = 'right',
}: PopoverMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const handleTriggerClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`app-popover-menu ${className}`}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={handleTriggerClick}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerClick();
          }
        }}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={`app-popover-menu-panel app-popover-menu-${align}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function PopoverMenuItem({
  children,
  onClick,
  variant = 'default',
  disabled = false,
}: PopoverMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`app-popover-menu-item ${variant === 'destructive' ? 'app-popover-menu-item-destructive' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

PopoverMenu.Item = PopoverMenuItem;
