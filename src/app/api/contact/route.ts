import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "hello@inzerv.com";
const FROM_EMAIL = "Inzerv <hello@inzerv.com>";

type Lang = "ar" | "en";

const i18n = {
  en: {
    subject: "We received your message — Inzerv",
    greeting: (name: string) => `Hi ${name},`,
    body: "Thank you for contacting Inzerv. We've received your message, and our customer service team will review it and respond during our working hours: 9:00 AM–9:00 PM, Cairo time.",
    followUp: 'If you would like to add details to your enquiry, you can reply to this email or contact us through the <a href="https://inzerv.com/en/contact" style="color:#10B7BE;text-decoration:underline">Contact Us</a> page on the Inzerv website.',
    refLabel: "Reference:",
    topicLabel: "Topic:",
    orderRefLabel: "Order Reference:",
    messageLabel: "Your message:",
    regards: "Best regards,",
    team: "The Inzerv Team",
    company: "Inzerv Group for Digital Marketing and Brokerage",
    dir: "ltr" as const,
    lang: "en",
  },
  ar: {
    subject: "استلمنا رسالتك — إنزيرف",
    greeting: (name: string) => `أهلًا ${name}،`,
    body: "شكرًا لتواصلك مع إنزيرف. استلمنا رسالتك، وسيراجعها فريق خدمة العملاء ويرد عليك خلال ساعات العمل: من ٩ صباحًا إلى ٩ مساءً بتوقيت القاهرة.",
    followUp: 'لو حابب تضيف تفاصيل لاستفسارك، تقدر ترد على الإيميل ده أو تتواصل معانا من صفحة <a href="https://inzerv.com/ar/contact" style="color:#10B7BE;text-decoration:underline">تواصل معنا</a> على موقع إنزيرف.',
    refLabel: "رقم المرجع:",
    topicLabel: "موضوع الرسالة:",
    orderRefLabel: "رقم الطلب المرجعي:",
    messageLabel: "رسالتك:",
    regards: "تحياتنا،",
    team: "فريق إنزيرف",
    company: "إنزيرف جروب للتسويق الرقمي والوساطة",
    dir: "rtl" as const,
    lang: "ar",
  },
} as const;

export async function POST(req: Request) {
  try {
    const { name, email, topic, orderRef, message, locale } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const lang: Lang = locale === "ar" ? "ar" : "en";
    const ticketRef = generateTicketRef();
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topic);
    const safeOrderRef = orderRef ? escapeHtml(String(orderRef).trim()) : "";
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    // Send notification to admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[${ticketRef}] Contact: ${topic || "General"} — ${name}`,
      html: adminEmail(ticketRef, safeName, safeEmail, safeTopic, safeOrderRef, safeMessage),
      replyTo: email,
    });

    // Send confirmation to user
    const t = i18n[lang];
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: t.subject,
      html: userEmail(t, ticketRef, safeName, safeTopic, safeOrderRef, safeMessage),
      replyTo: ADMIN_EMAIL,
    });

    return NextResponse.json({ ok: true, ticketRef });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

/* ── Shared layout wrapper ─────────────────────────────────── */

function layout(body: string, dir: "ltr" | "rtl" = "ltr", lang = "en"): string {
  const align = dir === "rtl" ? "right" : "left";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#F5F7F9;font-family:'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F7F9" dir="${dir}">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="background-color:#FFFFFF;padding:28px 40px;border-radius:16px 16px 0 0;border-left:1px solid #E8ECF0;border-right:1px solid #E8ECF0;border-top:1px solid #E8ECF0" align="center">
          <img src="https://inzerv.com/logo_email.png" alt="Inzerv — Designed with purpose. Built on trust. Made for you." width="220" style="display:block;max-width:220px;height:auto" />
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#FFFFFF;padding:40px 40px 32px;border-left:1px solid #E8ECF0;border-right:1px solid #E8ECF0;text-align:${align}">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#FFFFFF;padding:0 40px 32px;border-left:1px solid #E8ECF0;border-right:1px solid #E8ECF0;border-bottom:1px solid #E8ECF0;border-radius:0 0 16px 16px;text-align:${align}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="border-top:1px solid #E8ECF0;padding-top:24px;text-align:${align}">
            </td></tr>
          </table>
        </td></tr>

        <!-- Bottom bar -->
        <tr><td align="center" style="padding:24px 16px 0">
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Admin notification email ──────────────────────────────── */

function adminEmail(ticketRef: string, name: string, email: string, topic: string, orderRef: string, message: string): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#062544">New Contact Submission</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#667785" dir="ltr">${ticketRef}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F7F9;border-radius:12px;margin-bottom:24px">
      <tr><td style="padding:20px 24px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;font-size:13px;font-weight:500;color:#667785;width:80px;vertical-align:top">Name</td>
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
          ${orderRef ? `<tr>
            <td style="padding:6px 0;font-size:13px;font-weight:500;color:#667785;vertical-align:top">Order Ref</td>
            <td style="padding:6px 0;font-size:15px;color:#062544;font-weight:600" dir="ltr">${orderRef}</td>
          </tr>` : ""}
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

function userEmail(t: (typeof i18n)["en"] | (typeof i18n)["ar"], ticketRef: string, name: string, topic: string, orderRef: string, message: string): string {
  const borderSide = t.dir === "rtl" ? "border-right" : "border-left";

  return layout(`
    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#062544">${t.greeting(name)}</p>

    <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#062544">${t.body}</p>

    <!-- Ticket reference -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="background-color:#062544;border-radius:12px;padding:16px 20px">
        <p style="margin:0 0 2px;font-size:12px;color:rgba(255,255,255,0.6)">${t.refLabel}</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:1px" dir="ltr">${ticketRef}</p>
      </td></tr>
    </table>

    <!-- Message recap -->
    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#062544">${t.topicLabel}</p>
    <p style="margin:0 0 ${orderRef ? "16" : "20"}px;font-size:15px;color:#062544">${topic}</p>

    ${orderRef ? `<p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#062544">${t.orderRefLabel}</p>
    <p style="margin:0 0 20px;font-size:15px;color:#062544" dir="ltr">${orderRef}</p>` : ""}

    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#062544">${t.messageLabel}</p>
    <div style="background-color:#F5F7F9;${borderSide}:4px solid #10B7BE;border-radius:${t.dir === "rtl" ? "12px 0 0 12px" : "0 12px 12px 0"};padding:20px 24px;font-size:15px;line-height:1.8;color:#062544;margin:0 0 24px">
      ${message}
    </div>

    <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#667785">${t.followUp}</p>

    <!-- Sign-off -->
    <p style="margin:0 0 4px;font-size:15px;color:#667785">${t.regards}</p>
    <p style="margin:0 0 24px;font-size:15px;font-weight:600;color:#062544">${t.team}</p>

    <div style="border-top:1px solid #E8ECF0;padding-top:20px">
      <p style="margin:0;font-size:13px;color:#667785">${t.company}</p>
    </div>
  `, t.dir, t.lang);
}

/* ── Utility ───────────────────────────────────────────────── */

/** Generates a ticket reference like CS-20261109-A3F7 */
function generateTicketRef(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CS-${date}-${rand}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
