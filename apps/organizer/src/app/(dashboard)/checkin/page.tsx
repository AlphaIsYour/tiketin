// apps/organizer/src/app/(dashboard)/checkin/page.tsx
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@tiketin/ui';

export default function CheckinPage() {
    return (
        <>
            <Topbar title="Check-in" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    <EmptyState icon="ri-qr-scan-line" title="Select an event to check in attendees" description="Choose a published event to open the check-in scanner." />
                </div>
            </PageContainer>
        </>
    );
}