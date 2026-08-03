// apps/api/src/notifications/templates/payment-confirmed.template.ts
import { baseEmailLayout, emailButton } from './base.template';

export function paymentConfirmedTemplate(params: {
    buyerFullName: string;
    eventTitle: string;
    orderCode: string;
    ticketCount: number;
    orderUrl: string;
}) {
    const body = `
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">Halo ${params.buyerFullName},</p>
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">
      Pembayaran untuk pesanan <strong>${params.orderCode}</strong> pada event
      <strong>${params.eventTitle}</strong> berhasil dikonfirmasi. ${params.ticketCount} e-ticket kamu sudah siap.
    </p>
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">
      Tunjukkan QR tiket saat check-in di lokasi event.
    </p>
    ${emailButton('Lihat E-Ticket', params.orderUrl)}
  `;
    return { subject: `E-ticket kamu siap - ${params.orderCode}`, html: baseEmailLayout(body) };
}