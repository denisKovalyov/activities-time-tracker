import { auth } from '@/auth';
import { getActivities } from '@/lib/actions/activity';

export default async function Settings() {
  const session = await auth();
  const userId = session?.user?.id!;
  const date = new Date();
  const previousDate = await getActivities(userId, new Date(date.setDate(date.getDate() - 1)));
  console.log('previousDate', previousDate);
  return <div>Settings</div>;
}
