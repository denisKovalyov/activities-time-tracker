import { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { useSwipeable } from 'react-swipeable';
import { X, NotePencil } from '@phosphor-icons/react';

import { ActivityExtended } from '@/lib/definitions';
import { Card } from '@/ui/common/card';
import { cn } from '@/lib/utils';
import { PlayPauseButton } from '@/ui/dashboard/activities-list/play-pause-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-icon';
import { ActivityDropdownMenu } from '@/ui/dashboard/activities-list/activity-dropdown-menu';
import { Button } from '@/ui/common/button';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';

const buttonClassNames = 'w-0 h-full px-3 rounded-none dark:border-y dark:border-r transition-all duration-200';

export const ActivityItem = ({
  activity,
  swiped,
  onSwipe,
  onCancelSwipe,
}: {
  activity: ActivityExtended;
  swiped: boolean;
  onSwipe: (id: string) => void;
  onCancelSwipe: () => void;
}) => {
  const ref = useRef(null);

  const {
    id,
    name,
    color,
    icon,
    timeSpent,
  } = activity;

  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe(id),
    onSwipedRight: () => onCancelSwipe(),
    onSwiping: (e) => console.log(e),
  });

  const totalTimeSpent = useCalculateTimeValues(timeSpent);

  const handleClickOutsideButtons = () => {
    if (swiped) onCancelSwipe();
  };

  useOnClickOutside(ref, handleClickOutsideButtons, 'touchstart');

  return (
    <div className="relative">
      <Card
        className={cn('w-full flex justify-between items-center mb-4 p-4 transition-transform duration-200 ease-in-out', {
          '-translate-x-[110px] rounded-r-none': swiped,
        })}
        {...handlers}
      >
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

      <div
        ref={ref}
        className="absolute top-0 right-0 bottom-0 overflow-hidden"
      >
        <Button
          className={cn(buttonClassNames, {
            'w-auto': swiped,
            'px-0 border-none': !swiped,
          })}
          variant="warning"
          onClick={() => console.log('edit')}
        >
          <NotePencil size="30" />
        </Button>
        <Button
          className={cn(`${buttonClassNames} rounded-r-md`, {
            'w-auto': swiped,
            'px-0 border-none': !swiped,
          })}
          variant="destructive"
          onClick={() => console.log('delete')}
        >
          <X size="30" />
        </Button>
      </div>
    </div>
  );
};
