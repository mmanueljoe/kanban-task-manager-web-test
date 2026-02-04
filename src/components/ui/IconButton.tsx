import type { ButtonHTMLAttributes } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode;
  'aria-label': string;
  size?: 'small' | 'medium';
};

export function IconButton({
  icon,
  'aria-label': ariaLabel,
  size = 'medium',
  className = '',
  ...rest
}: IconButtonProps) {
  const sizeClass = size === 'small' ? 'app-icon-btn-sm' : '';

  return (
    <button
      type="button"
      className={`app-icon-btn ${sizeClass} ${className}`}
      aria-label={ariaLabel}
      {...rest}
    >
      {icon}
    </button>
  );
}
