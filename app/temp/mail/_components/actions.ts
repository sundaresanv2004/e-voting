"use server"

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendTestEmail(html: string, to: string, subject: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `E-Voting Dev <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
      to,
      subject: `[TEST] ${subject}`,
      html,
    });
    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error: any) {
    console.error("Test email failed:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
