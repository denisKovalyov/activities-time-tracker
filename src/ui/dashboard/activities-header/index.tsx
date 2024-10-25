import { useState, useEffect } from 'react';

import { AddActivityButton } from '@/ui/dashboard/activities-header/add-activity-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-card/activity-icon';
import { ConfirmReorderingButton } from '@/ui/dashboard/activities-header/confirm-reordering-button';
import { useRouter } from '@/ui/hooks/use-router';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { useStopwatch } from '@/ui/hooks/use-stopwatch';
import { getSecondsPassed } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ActivityExtended } from '@/lib/definitions';

const TitleComponent = ({
  className,
  onAnimationEnd,
  name,
  icon,
  color,
}: {
  className: string;
  onAnimationEnd: () => void;
  name: string;
  icon: string;
  color: string;
}) => (
  <div
    className={cn('flex items-center', className)}
    onAnimationEnd={onAnimationEnd}
  >
    <span className="mx-2 truncate font-semibold">
      {name}
    </span>
    <ActivityIcon
      className="flex-none"
      name={icon}
      color={`#${color}`}
    />
  </div>
);

const StopwatchComponent = ({
  className,
  activityId,
  dateStr,
}: {
  className: string;
  activityId: string;
  dateStr?: string
}) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + getSecondsPassed(dateStr));

  const {
    hours,
    minutes,
    seconds,
  } = useStopwatch(activityId);

  return (
    <span
      className={className}
      suppressHydrationWarning
    >
     {`${hours}:${minutes}:${seconds}`}
    </span>
  );
}

const headerBlockClasses =
  'flex justify-center items-center w-full py-4 px-4 bg-primary text-white font-bold truncate';

export const ActivitiesHeader = ({
  totalTimeSpent,
  activitiesNumber,
  activity,
  dateStr,
}: {
  totalTimeSpent: number;
  activitiesNumber: number;
  activity?: ActivityExtended;
  dateStr?: string;
}) => {
  const [animationClass, setAnimationClass] = useState('opacity-0');
  const { searchParams } = useRouter();

  useEffect(() => {
    if (activity) {
      setAnimationClass('animate-fly-in opacity-0');
    }
  }, [activity, setAnimationClass]);

  const handleAnimationEnd = () => setAnimationClass('');

  const Title = activity ? (
    <TitleComponent
      className={animationClass}
      onAnimationEnd={handleAnimationEnd}
      name={activity.name}
      color={activity.color}
      icon={activity.icon}
    />
  ) : (
    <span className="animate-vertical-shake">
      {activitiesNumber
        ? (<span>Time Spent:</span>)
        : (<span className="truncate">Add New Activity</span>)
      }
    </span>
  );

  const timeValues = useCalculateTimeValues(totalTimeSpent);

  const Stopwatch = activity ? (
    <StopwatchComponent
      key={activity.id}
      activityId={activity.id}
      className={animationClass}
      dateStr={dateStr}
    />
  ) : (
    <span className="animate-vertical-shake">
     {activitiesNumber ? (
       <span suppressHydrationWarning>
        {`${timeValues[0]}:${timeValues[1]}:${timeValues[2]}`}
      </span>
     ) : (
       <span className="truncate">To Start Using App</span>
     )}
    </span>
  );

  const reorderMode = Boolean(searchParams.get('reorder'));

  return (
    <div className="mx-auto flex w-full max-w-2xl justify-between">
      <div className={`${headerBlockClasses} rounded-l-full`}>
        {Title}
      </div>

      <div className="relative">
        <span className="absolute -left-2 box-content h-full w-full rounded-full bg-muted px-2" />
        {reorderMode ? <ConfirmReorderingButton /> : <AddActivityButton />}
      </div>

      <div className={`${headerBlockClasses} rounded-r-full`}>
        {Stopwatch}
      </div>
    </div>
  );
};
