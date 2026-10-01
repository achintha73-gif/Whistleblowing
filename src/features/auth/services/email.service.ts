import nodemailer, { Transporter } from 'nodemailer';
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} from '@/lib/auth-config';

/**
 * Email Service - reusable.
 *
 * In development, we use Ethereal (fake SMTP) which returns a preview URL.
 * In production, set real SMTP credentials in env and this code works unchanged.
 */

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return cachedTransporter;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendEmailResult {
  messageId: string;
  previewUrl: string | null;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: SMTP_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  if (previewUrl) {
    console.log('========================================');
    console.log('[EMAIL] Preview URL:', previewUrl);
    console.log('[EMAIL] To:', input.to);
    console.log('[EMAIL] Subject:', input.subject);
    console.log('========================================');
  }

  return {
    messageId: info.messageId,
    previewUrl,
  };
}