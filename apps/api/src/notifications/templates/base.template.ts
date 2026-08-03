// apps/api/src/notifications/templates/base.template.ts
export function baseEmailLayout(bodyHtml: string): string {
    return `
  <div style="font-family: -apple-system, 'Segoe UI', sans-serif; background-color: #f7f9fb; padding: 32px 16px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #eef1f5;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #eef1f5;">
        <span style="font-size: 16px; font-weight: 600; color: #171b21;">Tiketin</span>
      </div>
      <div style="padding: 24px;">
        ${bodyHtml}
      </div>
      <div style="padding: 16px 24px; background: #f7f9fb; font-size: 12px; color: #9aa5b1;">
        Email ini dikirim otomatis oleh Tiketin terkait status pesanan tiket kamu.
      </div>
    </div>
  </div>`;
}

export function emailButton(label: string, url: string): string {
    return `<a href="${url}" style="display:inline-block; background:#1e99d5; color:#ffffff; text-decoration:none; font-size:14px; font-weight:600; padding:10px 18px; border-radius:6px; margin-top:16px;">${label}</a>`;
}