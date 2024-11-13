import { auth } from '@/auth';

import { ActivityDialog } from '@/ui/dashboard/activity-dialog';
import { RemoveActivityDialog } from '@/ui/dashboard/remove-activity-dialog';
import { DashboardWrapper } from '@/ui/dashboard';
import { getActivities } from '@/lib/actions/activity';
import { getRecord } from '@/lib/actions/record';
import { getSecondsPassed } from '@/lib/utils';
import { retrieveDateFromCookies } from '@/app/(dashboard)/next-api-helpers';

export default async function Activities() {
  const session = await auth();
  const userId = session?.user?.id!;
  const date = await retrieveDateFromCookies();
  // console.log('date from cookies', date);
  const [activities, record] = await Promise.all([
    getActivities(userId!, date),
    getRecord(userId!, date),
  ]);

  if ('message' in activities) return null;

  const activeActivity =  record && 'current_activity' in record ? record.current_activity : null;

  let totalTimeSpent = getSecondsPassed(activeActivity?.[1]);
  const activitiesTimeMap = activities.reduce((acc, curr) => {
    const value = curr.time_spent;
    totalTimeSpent += value;
    return { ...acc, [curr.id]: value };
  }, {});

  return (
    <>
      <DashboardWrapper
        activities={activities}
        activitiesTimeMap={activitiesTimeMap}
        activeActivity={activeActivity}
        totalTimeSpent={totalTimeSpent}
      />

      <ActivityDialog activities={activities}/>
      <RemoveActivityDialog activities={activities}/>
    </>
  );
}
