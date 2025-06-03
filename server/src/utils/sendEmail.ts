import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || '');

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend || process.env.DISABLE_EMAILS === 'true') {
    console.log('Email would be sent:', {
      to,
      subject,
      html,
    });
    return;
  }
  resend.emails.send({
    from: 'Simple Interview <marika.developer+test@gmail.com>',
    to,
    subject,
    html,
  });
}
