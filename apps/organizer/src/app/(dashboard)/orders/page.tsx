// apps/organizer/src/app/(dashboard)/orders/page.tsx
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@tiketin/ui';

export default function OrdersPage() {
    return (
        <>
            <Topbar title="Orders" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    <EmptyState icon="ri-shopping-bag-line" title="No orders yet" description="Orders will appear here once buyers start purchasing tickets." />
                </div>
            </PageContainer>
        </>
    );
}