// apps/organizer/src/app/(dashboard)/staff/page.tsx
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@tiketin/ui';

export default function StaffPage() {
    return (
        <>
            <Topbar title="Staff" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    <EmptyState icon="ri-shield-user-line" title="No staff members yet" description="Invite staff to help manage events, sales, and check-in." />
                </div>
            </PageContainer>
        </>
    );
}