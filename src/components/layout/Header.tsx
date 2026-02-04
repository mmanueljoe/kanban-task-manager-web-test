import iconAddTask from '@assets/icon-add-task-mobile.svg';
import { BoardSelector } from './BoardSelector';
import { AccountMenu } from './AccountMenu';
import { BoardOptionsMenu } from './BoardOptionsMenu';

type HeaderProps = {
  onAddTask?: () => void;
  onCreateBoard?: () => void;
  onEditBoard?: () => void;
  onDeleteBoard?: () => void;
  canEditBoard?: boolean;
};

export function Header({
  onAddTask,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
  canEditBoard = false,
}: HeaderProps) {
  return (
    <header className="app-header">
      <BoardSelector onCreateBoard={onCreateBoard} />
      <div className="app-header-actions">
        <button
          type="button"
          className="btn btn-primary btn-small app-header-add-task"
          aria-label="Add task"
          onClick={onAddTask}
        >
          <img
            src={iconAddTask}
            alt=""
            width={12}
            height={12}
            aria-hidden
            className="app-header-add-task-icon"
          />
          <span className="app-header-add-label">+ Add New Task</span>
        </button>
        <AccountMenu />
        <BoardOptionsMenu
          onEditBoard={onEditBoard}
          onDeleteBoard={onDeleteBoard}
          canEditBoard={canEditBoard}
        />
      </div>
    </header>
  );
}
