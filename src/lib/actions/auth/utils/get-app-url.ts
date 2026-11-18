import 'server-only';

// Links in emails must not depend on request headers, a client controls them
export const getAppUrl = () => {
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  return domain ? `https://${domain}` : 'http://localhost:4000';
};
