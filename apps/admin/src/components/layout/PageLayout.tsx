// apps/admin/src/components/layout/PageContainer.tsx
export function PageContainer({ children }: { children: React.ReactNode }) {
    return <div className="p-6 max-w-7xl">{children}</div>;
}