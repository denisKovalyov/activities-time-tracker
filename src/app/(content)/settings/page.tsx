import { auth } from '@/auth';
import { dbGetUser } from '@/lib/db/users';
import { toDay } from '@/lib/utils/day';
import { SettingsTabs } from '@/ui/settings/tabs';
import { getUserTimeZone } from '@/app/(content)/next-api-helpers';

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab: activeTab }, session, timeZone] = await Promise.all([
    searchParams,
    auth(),
    getUserTimeZone(),
  ]);

  const email = session?.user?.email;
  const user = email ? await dbGetUser(email) : undefined;

  // Days are rendered the same on the server and the client, unlike dates
  // formatted in the time zone of whichever of them renders
  const account = user && {
    email: user.email,
    email_verified: user.email_verified,
    createdDay: toDay(user.created_at, timeZone),
    updatedDay: toDay(user.updated_at, timeZone),
  };

  return <SettingsTabs activeTab={activeTab} account={account} />;
}
