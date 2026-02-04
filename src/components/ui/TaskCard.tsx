import { forwardRef, type HTMLAttributes } from 'react';

type TaskCardProps = HTMLAttributes<HTMLLIElement> & {
  title: string;
  subtitle: string;
};

export const TaskCard = forwardRef<HTMLLIElement, TaskCardProps>(
  function TaskCard({ title, subtitle, className = '', ...rest }, ref) {
    return (
      <li ref={ref} className={`app-board-task ${className}`} {...rest}>
        <p className="app-board-task-title">{title}</p>
        <p className="app-board-task-subtasks">{subtitle}</p>
      </li>
    );
  }
);
