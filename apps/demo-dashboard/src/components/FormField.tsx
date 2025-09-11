'use client';
import React, { InputHTMLAttributes, useId, forwardRef } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const FormField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, id, className, ...inputProps }, ref) => {
    const reactId = useId();
    const inputId = id ?? reactId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy =
      [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

    const base = 'w-full rounded-md border px-3 py-2 outline-none transition focus:ring-2';
    const normal =
      'border-neutral-300 bg-white focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-neutral-200';
    const invalid = 'border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-400';

    return (
      <div className="mb-4">
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${base} ${error ? invalid : normal} ${className ?? ''}`}
          {...inputProps} // ✅ RHF의 onChange/onBlur/name/ref 모두 그대로 전달
        />

        {hint && !error && (
          <p id={hintId} className="mt-1 text-xs text-neutral-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';
