// apps/admin/src/app/(dashboard)/audit-logs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Table, Td, Th } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { apiClient } from '@/lib/api-client';

interface AuditLogRow {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    actor: { fullName: string; email: string } | null;
    createdAt: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get<{ items: AuditLogRow[] }>('/admin/audit-logs').then((res) => {
            setLogs(res.items);
            setIsLoading(false);
        });
    }, []);

    return (
        <>
            <Topbar title="Audit Log" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    {isLoading ? (
                        <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Waktu</Th>
                                    <Th>Aktor</Th>
                                    <Th>Entitas</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <Td className="text-xs">{new Date(log.createdAt).toLocaleString('id-ID')}</Td>
                                        <Td>{log.actor?.fullName ?? 'System'}</Td>
                                        <Td className="font-mono text-xs">
                                            {log.entityType}:{log.entityId.slice(0, 8)}
                                        </Td>
                                        <Td>{log.action}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </PageContainer>
        </>
    );
}