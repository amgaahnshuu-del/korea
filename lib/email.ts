import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: `"AjilKorea" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export function passwordResetEmail(resetUrl: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f7f8fb;border-radius:16px">
      <h2 style="color:#1e3a5f;margin-bottom:8px">Нууц үг шинэчлэх</h2>
      <p style="color:#555;font-size:14px;line-height:1.6">
        Та нууц үг шинэчлэх хүсэлт илгээсэн байна. Доорх товч дарж нууц үгээ шинэчлэнэ үү.
      </p>
      <a href="${resetUrl}"
        style="display:inline-block;margin:24px 0;padding:14px 28px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px">
        Нууц үг шинэчлэх →
      </a>
      <p style="color:#999;font-size:12px">
        Энэ линк <strong>1 цагийн</strong> дотор хүчинтэй. Та энэ хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомжиролно уу.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#bbb;font-size:11px">AjilKorea · ajilkorea.com</p>
    </div>
  `;
}

export function jobApplicationEmail({
  jobTitle,
  applicantName,
  applicantEmail,
  message,
  dashboardUrl,
}: {
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  message?: string;
  dashboardUrl: string;
}) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f7f8fb;border-radius:16px">
      <h2 style="color:#1e3a5f;margin-bottom:8px">Шинэ өргөдөл ирлээ</h2>
      <p style="color:#555;font-size:14px;line-height:1.6">
        <strong>${jobTitle}</strong> ажлын байранд шинэ өргөдөл ирлээ.
      </p>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px;font-size:13px;color:#374151"><strong>Нэр:</strong> ${applicantName}</p>
        <p style="margin:0 0 8px;font-size:13px;color:#374151"><strong>Имэйл:</strong> ${applicantEmail}</p>
        ${message ? `<p style="margin:0;font-size:13px;color:#374151"><strong>Мессеж:</strong> ${message}</p>` : ""}
      </div>
      <a href="${dashboardUrl}"
        style="display:inline-block;padding:14px 28px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px">
        Өргөдлийг харах →
      </a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#bbb;font-size:11px">AjilKorea · ajilkorea.com</p>
    </div>
  `;
}
