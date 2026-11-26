const APP_NAME = process.env.APP_NAME;

type EmailVerificationTemplateProps = {
  email: string;
  token: string;
  origin: string;
};

export const EmailVerificationTemplate = ({
  email,
  token,
  origin,
}: EmailVerificationTemplateProps) => {
  return (
    <div>
      <h1>{`Welcome to ${APP_NAME} app!`}</h1>
      <p>Click the link below to verify your email:</p>
      <a
        href={`${origin}/email/verify?email=${encodeURIComponent(email)}&token=${token}`}
      >
        Verify Email
      </a>
    </div>
  );
};
