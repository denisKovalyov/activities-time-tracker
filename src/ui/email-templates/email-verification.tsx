import { ReactElement } from 'react';

type EmailVerificationTemplateProps = {
  email: string;
  token: string;
  origin: string;
};

export const EmailVerificationTemplate = ({
  email,
  token,
  origin,
}: EmailVerificationTemplateProps): ReactElement => {
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
