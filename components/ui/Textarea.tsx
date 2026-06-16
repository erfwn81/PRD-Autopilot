'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-widest text-gray-500">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full rounded-xl bg-surface-2 border px-4 py-3 text-sm text-gray-100 placeholder-gray-600 transition-all resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 ${
          error ? 'border-danger/60' : 'border-white/8'
        } ${className}`}
        style={{ borderColor: error ? undefined : 'rgba(255,255,255,0.08)' }}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
);

Textarea.displayName = 'Textarea';
export default Textarea;
