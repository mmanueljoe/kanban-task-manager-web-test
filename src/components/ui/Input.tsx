import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  id?: string;
};

export function Input({
  label,
  error,
  className = '',
  id,
  ...rest
}: InputProps) {
  return (
    <div className={`input-wrap ${className}`}>
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      {error && (
        <span className="input-error-text" id={id ? `${id}-error` : undefined}>
          {error}
        </span>
      )}
    </div>
  );
}
