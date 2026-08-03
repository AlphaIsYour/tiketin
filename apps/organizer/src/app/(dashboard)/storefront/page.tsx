// apps/organizer/src/app/(dashboard)/storefront/page.tsx
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@tiketin/ui';

export default function StorefrontPage() {
    return (
        <>
            <Topbar title="Storefront" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    <EmptyState icon="ri-store-2-line" title="Storefront setup" description="Configure your organizer storefront branding, theme, and links." />
                </div>
            </PageContainer>
        </>
    );
}