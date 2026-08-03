// packages/ui/src/components/Input.tsx
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className = '', ...props }, ref) => (
        <input
            ref={ref}
            className={`w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
            {...props}
        />
    ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = '', ...props }, ref) => (
        <textarea
            ref={ref}
            className={`w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
            {...props}
        />
    ),
);
Textarea.displayName = 'Textarea';

export function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-sm font-medium text-[var(--color-gray-800)] mb-1">{children}</label>;
}