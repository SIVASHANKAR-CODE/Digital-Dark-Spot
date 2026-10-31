import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label = 'Loading...', className, ...props }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      role="status"
      className={clsx('inline-flex items-center justify-center text-indigo-600', className)}
      {...props}
    >
      <Loader2 className={clsx('animate-spin', sizes[size])} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

