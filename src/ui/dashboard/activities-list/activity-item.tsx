'use client';

import { ActivityExtended } from '@/lib/definitions';
import { Card } from '@/ui/common/card';
import { calculateTimeValues } from '@/lib/utils';
import { PlayPauseButton } from '@/ui/dashboard/activities-list/play-pause-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-icon';
import { ActivityDropdownMenu } from '@/ui/dashboard/activities-list/activity-dropdown-menu';

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
      <div className="flex-none flex items-center max-w-[70%] overflow-hidden">
          <PlayPauseButton className="flex-none" />
        <span className="font-semibold mx-2 text-accent-foreground truncate">
          {name}
        </span>
        <ActivityIcon className="flex-none" name={icon} color={`#${color}`} />
      </div>

      <div className="flex-none flex items-center">
        <span className="text-accent-foreground">
          {`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}
        </span>
        <ActivityDropdownMenu className="hidden sm:inline-flex ml-2" />
      </div>
    </Card>
  );
};
