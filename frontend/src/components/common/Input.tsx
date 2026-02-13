import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="input-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="input-error-text">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
