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

    // Send notification to admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Inzerv Contact: ${topic || "General"}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
        <hr />
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
      replyTo: email,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "We received your message — Inzerv",
      html: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thank you for reaching out. We have received your message and our team will get back to you during working hours (9 AM – 9 PM Cairo time).</p>
        <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${escapeHtml(message).replace(/\n/g, "<br />")}</blockquote>
        <br />
        <p>Best regards,<br />The Inzerv Team</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
