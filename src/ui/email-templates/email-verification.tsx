import { ReactElement } from 'react';
import { headers } from 'next/headers';

type EmailVerificationTemplateProps = {
  email: string;
  token: string;
};

export const EmailVerificationTemplate = ({
  email,
  token,
}: EmailVerificationTemplateProps): ReactElement => {
  const headersList = headers();
  const origin = headersList.get('origin');

  return (
    <div>
      <h1>{`Welcome to ${process.env.APP_NAME} app!`}</h1>
      <p>Click the link below to verify your email:</p>
      <a
        href={`${origin}/email/verify?email=${encodeURIComponent(email)}&token=${token}`}
      >
        Verify Email
      </a>
    </div>
  );
};
