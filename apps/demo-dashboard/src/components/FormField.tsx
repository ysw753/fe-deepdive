'use client';
import React, { InputHTMLAttributes, useId, forwardRef } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
  requiredMark?: boolean;
};

export const FormField = forwardRef<HTMLInputElement, Props>(function FormField(
  { label, error, hint, id, className, requiredMark, ...inputProps },
  ref
) {
  const reactId = useId();
  // id 우선순위: props.id -> name -> useId()
  const inputId = id ?? (inputProps.name as string) ?? reactId;

  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  // 화면에 실제로 렌더되는 요소만 aria-describedby에 포함
  const showHint = !!hint && !error;
  const describedBy =
    [error ? errorId : undefined, showHint ? hintId : undefined].filter(Boolean).join(' ') ||
    undefined;

  const base =
    'w-full rounded-md border px-3 py-2 outline-none transition ' +
    'focus-visible:ring-2 focus-visible:ring-offset-2';
  const normal =
    'border-neutral-300 bg-white focus-visible:ring-neutral-900 ' +
    'dark:border-neutral-700 dark:bg-neutral-900 dark:focus-visible:ring-neutral-200';
  const invalid =
    'border-red-500 focus-visible:ring-red-500 ' +
    'dark:border-red-500 dark:focus-visible:ring-red-400';

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
        {label}
        {(inputProps.required || requiredMark) && (
          <span aria-hidden="true" className="text-red-600">
            {' '}
            *
          </span>
        )}
      </label>

      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? errorId : undefined}
        aria-describedby={describedBy}
        className={`${base} ${error ? invalid : normal} ${className ?? ''}`}
        {...inputProps} // RHF props 그대로 전달
      />

      {showHint && (
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
});
FormField.displayName = 'FormField';
