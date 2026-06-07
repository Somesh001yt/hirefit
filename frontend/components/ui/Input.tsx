'use client';

import { ChangeEvent } from 'react';

interface InputProps {
  label?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Input({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  required,
  disabled,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={[
          'rounded-lg border px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
          error
            ? 'border-[var(--color-danger)]'
            : 'border-[var(--color-border)]',
          disabled ? 'opacity-50 cursor-not-allowed bg-[var(--color-background)]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {error && (
        <p className="text-xs text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}
