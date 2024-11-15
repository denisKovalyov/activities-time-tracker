import { useState, useEffect } from 'react';

import { AddActivityButton } from '@/ui/dashboard/activities-header/add-activity-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-card/activity-icon';
import { ConfirmReorderingButton } from '@/ui/dashboard/activities-header/confirm-reordering-button';
import { StopRecordButton } from '@/ui/dashboard/activities-header/stop-record-button';
import { useRouter } from '@/ui/hooks/use-router';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { useRecord } from '@/ui/providers/record-provider';
import { useSharedStopwatch } from '@/ui/hooks/use-shared-stopwatch';
import { ActivityExtended } from '@/lib/definitions';
import { cn } from '@/lib/utils';

const TitleComponent = ({
  className,
  onAnimationEnd,
  name,
  icon,
}: {
  className: string;
  onAnimationEnd: () => void;
  name: string;
  icon: string;
}) => (
  <div
    className={cn('flex items-center truncate', className)}
    onAnimationEnd={onAnimationEnd}
  >
    <span className="mx-2 truncate font-semibold">
      {name}
    </span>
    <ActivityIcon
      className="flex-none"
      name={icon}
      color="white"
      weight="duotone"
    />
  </div>
);

const StopwatchComponent = ({ className }: { className: string; }) => {
  const { value } = useSharedStopwatch();
  const timeValues = useCalculateTimeValues(value);

  return (
    <span
      className={className}
      suppressHydrationWarning
    >
     {`${timeValues[0]}:${timeValues[1]}:${timeValues[2]}`}
    </span>
  );
}

const headerBlockClasses =
  'flex justify-center items-center w-full py-4 px-4 bg-primary text-white font-bold truncate';

export const ActivitiesHeader = ({
  totalTimeSpent,
  activities,
}: {
  totalTimeSpent: number;
  activities: ActivityExtended[];
}) => {
  const [animationClass, setAnimationClass] = useState('opacity-0');
  const { searchParams } = useRouter();
  const { activeId, setActiveId } = useRecord();

  const activitiesNumber = activities.length;

  useEffect(() => {
    if (activeId) {
      setAnimationClass('animate-fly-in opacity-0');
    }
  }, [activeId, setAnimationClass]);

  const activity = activities.find(({ id }) => id === activeId);

  const handleAnimationEnd = () => setAnimationClass('');

  const Title = activity ? (
    <TitleComponent
      className={animationClass}
      onAnimationEnd={handleAnimationEnd}
      name={activity.name}
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
      className={animationClass}
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

  const handleStopRecord = () => setActiveId(null);

  const reorderMode = Boolean(searchParams.get('reorder'));

  const Button = reorderMode
    ? <ConfirmReorderingButton />
    : activeId ? <StopRecordButton onClick={handleStopRecord} /> : <AddActivityButton />

  return (
    <div className="mx-auto flex w-full max-w-2xl justify-between">
      <div className={`${headerBlockClasses} rounded-l-full`}>
        {Title}
      </div>

      <div className="relative">
        <span className="absolute -left-2 box-content h-full w-full rounded-full bg-muted px-2" />
        {Button}
      </div>

      <div className={`${headerBlockClasses} rounded-r-full`}>
        {Stopwatch}
      </div>
    </div>
  );
};
