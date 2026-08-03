// packages/ui/src/components/Table.tsx
import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({ className = '', ...props }: HTMLAttributes<HTMLTableElement>) {
    return (
        <div className="overflow-x-auto">
            <table className={`w-full text-sm ${className}`} {...props} />
        </div>
    );
}

export function Th({ className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            className={`text-left font-medium text-[var(--color-gray-600)] px-4 py-2.5 border-b border-[var(--color-gray-200)] ${className}`}
            {...props}
        />
    );
}

export function Td({ className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td className={`px-4 py-3 border-b border-[var(--color-gray-100)] text-[var(--color-gray-800)] ${className}`} {...props} />
    );
}