import { ReactElement } from 'react';
import { headers } from 'next/headers';

type ResetPasswordTemplateProps = {
  email: string;
  token: string;
};

export const ResetPasswordTemplate = ({
  email,
  token,
}: ResetPasswordTemplateProps): ReactElement => {
  const headersList = headers();
  const origin = headersList.get('origin');

  return (
    <div>
      <h1>Reset Password for Activities Time Tracker account</h1>
      <p>Hello,</p>
      <p>{`It appears that you've requested to reset your password for your account with Activities Time Tracker.
      We're here to help you secure your account quickly and easily.`}</p>
      <p>To set a new password, please click on the following link:</p>
      <a href={`${origin}/reset-password?email=${email}&token=${token}`}>
        Reset Password
      </a>
      <p>{`If you did not request this password reset,please ignore this email.
      Your account security is important to us,
      and we recommend that you contact our support team immediately if you suspect any unauthorized activity.`}</p>
      <p>Thank you for your attention to this matter.</p>
      <p>Best regards,</p>
      <p>Activities Time Tracker Team</p>
    </div>
  );
};
