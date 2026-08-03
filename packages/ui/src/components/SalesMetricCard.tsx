// packages/ui/src/components/SalesMetricCard.tsx
import { Card, CardBody } from './Card';

interface SalesMetricCardProps {
    label: string;
    value: string;
    icon?: string;
    trend?: { direction: 'up' | 'down'; value: string };
}

export function SalesMetricCard({ label, value, icon, trend }: SalesMetricCardProps) {
    return (
        <Card>
            <CardBody className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-[var(--color-gray-600)]">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--color-gray-900)]">{value}</p>
                    {trend && (
                        <p className={`mt-1 text-xs font-medium ${trend.direction === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                            {trend.direction === 'up' ? 'up' : 'down'} {trend.value}
                        </p>
                    )}
                </div>
                {icon && <i className={`${icon} text-xl text-[var(--color-primary)]`} />}
            </CardBody>
        </Card>
    );
}