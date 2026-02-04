import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useBoards } from '@/hooks/useBoards';
import { useCurrentBoard } from '@/hooks/useCurrentBoard';
import { useClickOutside } from '@/hooks/useClickOutside';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import iconChevronDown from '@assets/icon-chevron-down.svg';
import iconBoard from '@assets/icon-board.svg';
import logoMobile from '@assets/logo-mobile.svg';

type BoardSelectorProps = {
  onCreateBoard?: () => void;
};

export function BoardSelector({ onCreateBoard }: BoardSelectorProps) {
  const { boards } = useBoards();
  const { board, boardIndex } = useCurrentBoard();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const currentBoardName =
    board != null && boardIndex != null ? board.name : 'Boards';

  return (
    <div className="app-header-left" ref={dropdownRef}>
      <img
        src={logoMobile}
        alt=""
        className="app-header-logo"
        width={24}
        height={25}
      />
      <button
        type="button"
        className="app-header-board-trigger"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="app-header-board-trigger-text">
          {currentBoardName}
        </span>
        <img
          src={iconChevronDown}
          alt=""
          width={10}
          height={7}
          className={`app-header-board-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>
      <span className="app-header-board-name" title={currentBoardName}>
        {currentBoardName}
      </span>
      {isOpen && (
        <div
          className="app-board-dropdown"
          role="dialog"
          aria-label="Board selector"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="app-board-dropdown-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="app-board-dropdown-title">
              ALL BOARDS ({boards.length})
            </p>
            <ul className="app-board-dropdown-list">
              {boards.map((b, index) => (
                <li key={b.name}>
                  <Link
                    to={`/board/${index}`}
                    className={`app-board-dropdown-item ${boardIndex === index ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <img
                      src={iconBoard}
                      alt=""
                      width={16}
                      height={16}
                      className="app-board-dropdown-item-icon"
                      style={{ opacity: boardIndex === index ? 1 : 0.5 }}
                    />
                    {b.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="app-board-dropdown-item create"
                  onClick={() => {
                    onCreateBoard?.();
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={iconBoard}
                    alt=""
                    width={16}
                    height={16}
                    className="app-board-dropdown-item-icon"
                    style={{ opacity: 0.5 }}
                  />
                  + Create New Board
                </button>
              </li>
            </ul>
            <ThemeToggle className="app-board-dropdown-theme" />
          </div>
        </div>
      )}
    </div>
  );
}
