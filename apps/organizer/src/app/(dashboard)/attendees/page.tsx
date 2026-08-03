// apps/organizer/src/app/(dashboard)/attendees/page.tsx
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@tiketin/ui';

export default function AttendeesPage() {
    return (
        <>
            <Topbar title="Attendees" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    <EmptyState icon="ri-team-line" title="No attendees yet" description="Attendee lists will populate once tickets are sold and issued." />
                </div>
            </PageContainer>
        </>
    );
}