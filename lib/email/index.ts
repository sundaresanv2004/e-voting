import { Resend } from 'resend';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  const html = await render(react);
  return resend.emails.send({
    from: `E-Voting <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to,
    subject,
    html,
  });
}
