import * as React from 'react';
import { headers } from 'next/headers';

type EmailVerificationTemplateProps = {
  email: string;
  token: string;
};

export const EmailVerificationTemplate = ({
  email,
  token,
}: EmailVerificationTemplateProps): React.ReactElement => {
  const headersList = headers();
  const origin = headersList.get('origin');

  return (
    <div>
      <h1>Welcome to Activities Time Tracker app!</h1>
      <p>Click the link below to verify your email:</p>
      <a href={`${origin}/email/verify?email=${email}&token=${token}`}>
        Verify Email
      </a>
    </div>
  );
};
