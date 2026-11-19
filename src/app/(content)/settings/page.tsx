import { auth } from '@/auth';
import { getUser as dbGetUser } from '@/lib/db/users';
import { SettingsTabs } from '@/ui/settings/tabs';

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab: activeTab }, session] = await Promise.all([
    searchParams,
    auth(),
  ]);

  const email = session?.user?.email;
  const user = email ? await dbGetUser(email) : undefined;

  const account = user && {
    email: user.email,
    email_verified: user.email_verified,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return <SettingsTabs activeTab={activeTab} account={account} />;
}
