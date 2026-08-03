// apps/api/src/notifications/templates/order-created.template.ts
import { baseEmailLayout, emailButton } from './base.template';

export function orderCreatedTemplate(params: {
    buyerFullName: string;
    eventTitle: string;
    orderCode: string;
    totalAmount: string;
    orderUrl: string;
}) {
    const body = `
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">Halo ${params.buyerFullName},</p>
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">
      Pesanan kamu untuk <strong>${params.eventTitle}</strong> telah dibuat dengan kode
      <strong>${params.orderCode}</strong>. Selesaikan pembayaran sebesar
      <strong>${params.totalAmount}</strong> untuk menerbitkan e-ticket kamu.
    </p>
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">
      Simpan tautan ini untuk memantau status pesanan dan mengakses tiket setelah pembayaran berhasil, kapan pun kamu butuhkan.
    </p>
    ${emailButton('Lihat Pesanan', params.orderUrl)}
  `;
    return { subject: `Pesanan ${params.orderCode} dibuat - Tiketin`, html: baseEmailLayout(body) };
}