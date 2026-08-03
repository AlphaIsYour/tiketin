// packages/ui/src/components/Modal.tsx
'use client';

import { ReactNode } from 'react';

export function Modal({
    isOpen,
    onClose,
    title,
    children,
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-[var(--radius-md)] shadow-[var(--shadow-md)] w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-gray-100)]">
                    <span className="text-sm font-semibold text-[var(--color-gray-900)]">{title}</span>
                    <button onClick={onClose} className="text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)]">
                        <i className="ri-close-line text-lg" />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}