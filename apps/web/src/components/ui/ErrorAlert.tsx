import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = 'An error occurred',
  message,
  onRetry,
  className,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 flex items-start gap-3',
        className
      )}
    >
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-800">{title}</h4>
        <p className="mt-0.5 text-sm text-rose-700">{message}</p>
        {onRetry && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="bg-white border-rose-300 text-rose-700 hover:bg-rose-50"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

