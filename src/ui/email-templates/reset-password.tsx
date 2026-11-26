const APP_NAME = process.env.APP_NAME;
const SUPPORT_EMAIL = process.env.APP_SUPPORT_EMAIL;

type ResetPasswordTemplateProps = {
  email: string;
  token: string;
  origin: string;
};

export const ResetPasswordTemplate = ({
  email,
  token,
  origin,
}: ResetPasswordTemplateProps) => {
  return (
    <div>
      <h1>{`Reset Password for ${APP_NAME} account`}</h1>
      <p>Hello,</p>
      <p>{`It appears that you've requested to reset your password for your account with ${APP_NAME}.
      We're here to help you secure your account quickly and easily.`}</p>
      <p>To set a new password, please click on the following link:</p>
      <a
        href={`${origin}/reset-password?email=${encodeURIComponent(email)}&token=${token}`}
      >
        Reset Password
      </a>
      <p>
        {`If you did not request this password reset, please ignore this email.
        Your account security is important to us, and we recommend that you
        contact our support team at `}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        {` immediately if you suspect any unauthorized activity.`}
      </p>
      <p>Thank you for your attention to this matter.</p>
      <p>Best regards,</p>
      <p>{`${APP_NAME} Team`}</p>
    </div>
  );
};
