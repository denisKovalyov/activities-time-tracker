import { auth } from '@/auth';
import { FolderOpen } from '@phosphor-icons/react/dist/ssr';

import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { ActivityDialog } from '@/ui/dashboard/activity-dialog';
import { RemoveActivityDialog } from '@/ui/dashboard/remove-activity-dialog';
import { ActivitiesListWrapper } from '@/ui/dashboard/activities-list';
import { getActivities } from '@/lib/actions/activity';
import { getRecord } from '@/lib/actions/record';
import { getSecondsPassed } from '@/lib/actions/data/utils';

export default async function Activities() {
  const session = await auth();
  const userId = session?.user?.id!;

  const [activities, record] = await Promise.all([
    getActivities(userId!),
    getRecord(userId!),
  ]);

  if ('message' in activities) return null;

  const activeActivity =  record && 'current_activity' in record ? record.current_activity : null;
  const startTimestamp = activeActivity?.[1] || null;
  const activitiesTimeMap = activities.reduce((acc, curr) => {
      const value = curr.timeSpent + (curr.id === activeActivity?.[0] ? getSecondsPassed(activeActivity?.[1]) : 0);
      return {
        ...acc,
        [curr.id]: value,
      }
    }, {});

  return (
    <>
      <div className="flex h-full w-full flex-col">
        <ActivitiesHeader
          startTimestamp={startTimestamp}
          activities={activities}
        />

        {activities.length === 0 ? (
          <div className="flex w-full flex-1">
            <div className="m-auto flex flex-col items-center">
              <FolderOpen
                className="h-auto w-28 text-primary"
                weight="duotone"
              />
              <h2 className="font-normal text-primary">
                {"You don't have any activities yet"}
              </h2>
            </div>
          </div>
        ) : (
          <ActivitiesListWrapper
            activeActivity={activeActivity}
            activities={activities}
            activitiesTimeMap={activitiesTimeMap}
          />
        )}
      </div>

      <ActivityDialog activities={activities} />
      <RemoveActivityDialog activities={activities} />
    </>
  );
}
