import { Resend } from 'resend';

export const emailProvider = new Resend(process.env.RESEND_API_KEY);
export const emailSendDomain = process.env.APP_DOMAIN_NAME;
