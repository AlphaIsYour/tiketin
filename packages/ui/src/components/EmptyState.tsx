// packages/ui/src/components/EmptyState.tsx
export function EmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <i className={`${icon} text-3xl text-[var(--color-gray-400)] mb-3`} />
            <p className="text-sm font-medium text-[var(--color-gray-800)]">{title}</p>
            <p className="text-sm text-[var(--color-gray-600)] mt-1 max-w-sm">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}