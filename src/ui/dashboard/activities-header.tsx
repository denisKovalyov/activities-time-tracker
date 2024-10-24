'use client';

import { AddActivityButton } from '@/ui/dashboard/add-activity-button';
import { ConfirmReorderingButton } from '@/ui/dashboard/confirm-reordering-button';
import { useRouter } from '@/ui/hooks/use-router';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';

const headerBlockClasses =
  'flex justify-center items-center w-full py-4 px-4 bg-primary text-white font-bold truncate';

export const ActivitiesHeader = ({
  totalTimeSpent,
  activitiesNumber,
}: {
  totalTimeSpent: number;
  activitiesNumber: number;
}) => {
  const { searchParams } = useRouter();
  const timeValues = useCalculateTimeValues(totalTimeSpent);

  const reorderMode = Boolean(searchParams.get('reorder'));

  return (
    <div className="mx-auto flex w-full max-w-2xl justify-between">
      <div className={`${headerBlockClasses} rounded-l-full`}>
        {activitiesNumber ? (
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
        {activitiesNumber ? (
          <span suppressHydrationWarning>{`${timeValues[0]}:${timeValues[1]}:${timeValues[2]}`}</span>
        ) : (
          <span className="truncate">To Start Using App</span>
        )}
      </div>
    </div>
  );
};
