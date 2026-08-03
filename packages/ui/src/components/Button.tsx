// packages/ui/src/components/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
    secondary: 'bg-white text-[var(--color-gray-800)] border border-[var(--color-gray-200)] hover:border-[var(--color-gray-400)]',
    ghost: 'bg-transparent text-[var(--color-gray-800)] hover:bg-[var(--color-gray-100)]',
    danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
};

const sizeClasses: Record<Size, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => (
        <button
            ref={ref}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        />
    ),
);
Button.displayName = 'Button';