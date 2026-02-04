import type { ReactNode } from 'react';

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

export function PageCard({ children, className = '' }: PageCardProps) {
  return <div className={`app-page-card ${className}`}>{children}</div>;
}
