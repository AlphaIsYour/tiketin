// packages/ui/src/components/Card.tsx
import { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] ${className}`}
            {...props}
        />
    );
}

export function CardHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`px-5 py-4 border-b border-[var(--color-gray-100)] ${className}`} {...props} />;
}

export function CardBody({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`px-5 py-4 ${className}`} {...props} />;
}