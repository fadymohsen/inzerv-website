import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "hello@inzerv.com";
const FROM_EMAIL = "Inzerv <no-reply@inzerv.com>";

export async function POST(req: Request) {
  try {
    const { name, email, topic, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topic);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    // Send notification to admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Contact: ${topic || "General"} — ${name}`,
      html: adminEmail(safeName, safeEmail, safeTopic, safeMessage),
      replyTo: email,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "We received your message — Inzerv",
      html: userEmail(safeName, safeTopic, safeMessage),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

/* ── Shared layout wrapper ─────────────────────────────────── */

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#F5F7F9;font-family:'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F7F9">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="background-color:#062544;padding:32px 40px;border-radius:16px 16px 0 0" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:28px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px">
                <span style="color:#10B7BE">I</span>NZERV
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#FFFFFF;padding:40px 40px 32px;border-left:1px solid #E8ECF0;border-right:1px solid #E8ECF0">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#FFFFFF;padding:0 40px 32px;border-left:1px solid #E8ECF0;border-right:1px solid #E8ECF0;border-bottom:1px solid #E8ECF0;border-radius:0 0 16px 16px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="border-top:1px solid #E8ECF0;padding-top:24px">
              <p style="margin:0 0 4px;font-size:14px;color:#667785">Best regards,</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#062544">The Inzerv Team</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Bottom bar -->
        <tr><td align="center" style="padding:24px 16px 0">
          <p style="margin:0 0 6px;font-size:12px;color:#667785">Inzerv Group for Digital Marketing &amp; Brokerage</p>
          <p style="margin:0;font-size:12px;color:#667785">8 Green Towers, Smouha, Alexandria, Egypt</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Admin notification email ──────────────────────────────── */

function adminEmail(name: string, email: string, topic: string, message: string): string {
  return layout(`
    <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#062544">New Contact Submission</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F7F9;border-radius:12px;margin-bottom:24px">
      <tr><td style="padding:20px 24px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;font-size:13px;font-weight:500;color:#667785;width:70px;vertical-align:top">Name</td>
            <td style="padding:6px 0;font-size:15px;color:#062544;font-weight:600">${name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;font-weight:500;color:#667785;vertical-align:top">Email</td>
            <td style="padding:6px 0;font-size:15px;color:#062544"><a href="mailto:${email}" style="color:#10B7BE;text-decoration:none">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;font-weight:500;color:#667785;vertical-align:top">Topic</td>
            <td style="padding:6px 0;font-size:15px;color:#062544">${topic}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#062544;text-transform:uppercase;letter-spacing:0.5px">Message</h2>
    <div style="background-color:#F5F7F9;border-left:4px solid #10B7BE;border-radius:0 12px 12px 0;padding:20px 24px;font-size:15px;line-height:1.7;color:#062544">
      ${message}
    </div>
  `);
}

/* ── User confirmation email ───────────────────────────────── */

function userEmail(name: string, topic: string, message: string): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#062544">We received your message</h1>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#667785">Hi ${name}, thank you for reaching out.</p>

    <!-- Turquoise info box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr><td style="background-color:#10B7BE;border-radius:12px;padding:20px 24px">
        <p style="margin:0;font-size:15px;line-height:1.6;color:#062544;font-weight:500">
          Our team will get back to you during working hours<br/>
          <strong>9 AM &ndash; 9 PM Cairo time</strong>
        </p>
      </td></tr>
    </table>

    <!-- Message recap -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F7F9;border-radius:12px;margin-bottom:24px">
      <tr><td style="padding:20px 24px">
        <p style="margin:0 0 4px;font-size:13px;font-weight:500;color:#667785">Topic</p>
        <p style="margin:0 0 16px;font-size:15px;color:#062544;font-weight:600">${topic}</p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:500;color:#667785">Your message</p>
        <div style="margin:0;font-size:15px;line-height:1.7;color:#062544">${message}</div>
      </td></tr>
    </table>

    <p style="margin:0;font-size:14px;line-height:1.6;color:#667785">
      If you need faster help, open <strong>Help &amp; Support</strong> in the Inzerv app, or reply to this email.
    </p>
  `);
}

/* ── Utility ───────────────────────────────────────────────── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
