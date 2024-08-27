import { emailApiProvider, type SendEmailParameters } from '@/lib/email-api';

export async function sendEmail(params: SendEmailParameters) {
  return await emailApiProvider.sendEmail(params);
}
