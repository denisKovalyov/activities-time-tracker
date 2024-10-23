'use client';

import { AddActivityButton } from '@/ui/dashboard/add-activity-button';
import { ConfirmReorderingButton } from '@/ui/dashboard/confirm-reordering-button';
import { ActivityExtended } from '@/lib/definitions';
import { useRouter } from '@/ui/hooks/use-router';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { getSecondsPassed } from '@/lib/actions/data/utils';

const headerBlockClasses =
  'flex justify-center items-center w-full py-4 px-4 bg-primary text-white font-bold truncate';

export const ActivitiesHeader = ({
  activities,
  startTimestamp,
}: {
  activities: ActivityExtended[];
  startTimestamp: string | null;
}) => {
  const { searchParams } = useRouter();

  const reorderMode = Boolean(searchParams.get('reorder'));

  const totalTimeSpent = useCalculateTimeValues(
    getSecondsPassed(startTimestamp) +
     activities.reduce((acc, curr) => acc + (curr?.timeSpent || 0), 0),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl justify-between">
      <div className={`${headerBlockClasses} rounded-l-full`}>
        {activities.length ? (
          <span>Time Spent:</span>
        ) : (
          <span className="truncate">Add New Activity</span>
        )}
      </div>

      <div className="relative">
        <span className="absolute -left-2 box-content h-full w-full rounded-full bg-muted px-2" />
        {reorderMode ? <ConfirmReorderingButton /> : <AddActivityButton />}
      </div>

      <div className={`${headerBlockClasses} rounded-r-full`}>
        {activities.length ? (
          <span suppressHydrationWarning>{`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}</span>
        ) : (
          <span className="truncate">To Start Using App</span>
        )}
      </div>
    </div>
  );
};
