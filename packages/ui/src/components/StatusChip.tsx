// packages/ui/src/components/StatusChip.tsx
import { Badge } from './Badge';

const EVENT_STATUS_TONE: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
    DRAFT: 'neutral',
    PUBLISHED: 'success',
    UNPUBLISHED: 'warning',
    CANCELLED: 'danger',
    COMPLETED: 'neutral',
};

const ORDER_STATUS_TONE: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    PAID: 'success',
    EXPIRED: 'neutral',
    FAILED: 'danger',
    CANCELLED: 'neutral',
    REFUNDED_PARTIAL: 'warning',
    REFUNDED_FULL: 'danger',
};

export function EventStatusChip({ status }: { status: string }) {
    return <Badge tone={EVENT_STATUS_TONE[status] ?? 'neutral'}>{status}</Badge>;
}

export function OrderStatusChip({ status }: { status: string }) {
    return <Badge tone={ORDER_STATUS_TONE[status] ?? 'neutral'}>{status}</Badge>;
}