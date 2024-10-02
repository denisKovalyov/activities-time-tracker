import { Suspense } from 'react';

import { ActivityExtended } from '@/lib/definitions';
import { Card } from '@/ui/common/card';
import { calculateTimeValues } from '@/lib/utils';
import { Skeleton } from '@/ui/common/skeleton';
import { PlayPauseButton } from '@/ui/dashboard/activities-list/play-pause-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-icon';

export const ActivityItem = ({
  activity,
}: {
  activity: ActivityExtended,
}) => {
  const {
    name,
    color,
    icon,
    timeSpent,
  } = activity;
  const totalTimeSpent = calculateTimeValues(timeSpent);

  return (
    <Card className="w-full flex justify-between items-center mb-4 p-4">
      <div className="flex items-center">
        <Suspense fallback={<Skeleton className="w-9 h-9" />}>
          <PlayPauseButton />
        </Suspense>
        <span className="font-semibold mx-2" style={{color: `#${color}`}}>
          {name}
        </span>
        <Suspense fallback={<Skeleton className="w-5 h-5" />}>
          <ActivityIcon name={icon} color={`#${color}`} />
        </Suspense>
      </div>
      <div>
        {`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}
      </div>
    </Card>
  );
};
