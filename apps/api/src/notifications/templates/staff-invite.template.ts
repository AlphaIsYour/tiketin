// apps/api/src/notifications/templates/staff-invite.template.ts
import { baseEmailLayout, emailButton } from './base.template';

const ROLE_LABEL: Record<string, string> = {
    MANAGER: 'Manager',
    STAFF: 'Staff',
    SCANNER: 'Petugas Check-in',
};

export function staffInviteTemplate(params: { organizerName: string; role: string; inviteUrl: string }) {
    const body = `
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">Halo,</p>
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">
      Kamu diundang untuk bergabung sebagai <strong>${ROLE_LABEL[params.role] ?? params.role}</strong>
      di organizer <strong>${params.organizerName}</strong> pada Tiketin.
    </p>
    <p style="font-size:14px; color:#2a303b; margin:0 0 12px;">
      Klik tombol di bawah untuk menerima undangan. Jika kamu belum punya akun, kamu akan diminta membuat akun terlebih dahulu.
    </p>
    ${emailButton('Terima Undangan', params.inviteUrl)}
    <p style="font-size:12px; color:#9aa5b1; margin:16px 0 0;">Undangan ini berlaku selama 7 hari.</p>
  `;
    return { subject: `Undangan bergabung dengan ${params.organizerName} - Tiketin`, html: baseEmailLayout(body) };
}