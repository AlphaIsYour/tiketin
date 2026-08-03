// apps/organizer/src/app/(dashboard)/settings/page.tsx
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';

export default function SettingsPage() {
    return (
        <>
            <Topbar title="Settings" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-5 text-sm text-[var(--color-gray-600)]">
                    Organizer profile and account settings.
                </div>
            </PageContainer>
        </>
    );
}