import { auth } from '@/auth';
import { cookies } from 'next/headers';

import { ActivityDialog } from '@/ui/dashboard/activity-dialog';
import { RemoveActivityDialog } from '@/ui/dashboard/remove-activity-dialog';
import { ProvidersWrapper} from '@/ui/dashboard';
import { SetCookies } from '@/ui/dashboard/set-cookies';
import { getActivities } from '@/lib/actions/activity';
import { getRecord } from '@/lib/actions/record';
import { getSecondsPassed } from '@/lib/utils';

export default async function Activities() {
  const session = await auth();
  const userId = session?.user?.id!;
  const cookiesStore = await cookies();
  const { value: dateStr } = cookiesStore.get('user-date') || {};

  const date = dateStr ? new Date(dateStr) : new Date();

  const [activities, record] = await Promise.all([
    getActivities(userId!, date),
    getRecord(userId!, date),
  ]);

  if ('message' in activities) return null;

  const activeActivity =  record && 'current_activity' in record ? record.current_activity : null;

  let totalTimeSpent = getSecondsPassed(activeActivity?.[1]);
  const activitiesTimeMap = activities.reduce((acc, curr) => {
    const value = curr.timeSpent;
    totalTimeSpent += value;
    return { ...acc, [curr.id]: value };
  }, {});

  return (
    <>
      <ProvidersWrapper
        activeActivity={activeActivity}
        activities={activities}
        activitiesTimeMap={activitiesTimeMap}
        totalTimeSpent={totalTimeSpent}
      />
      <ActivityDialog activities={activities} />
      <RemoveActivityDialog activities={activities} />
      <SetCookies />
    </>
  );
}
