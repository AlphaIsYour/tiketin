// packages/ui/src/components/Badge.tsx
type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary';

const toneClasses: Record<BadgeTone, string> = {
    neutral: 'bg-[var(--color-gray-100)] text-[var(--color-gray-800)]',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    primary: 'bg-[#e8f4fb] text-[var(--color-primary-dark)]',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] text-xs font-medium ${toneClasses[tone]}`}>
            {children}
        </span>
    );
}