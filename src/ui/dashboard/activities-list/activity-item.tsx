import { useRef, useState } from 'react';
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
  const [shift, setShift] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
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
    onSwipedRight: () => {
      if (swiped) onCancelSwipe();
    },
    onSwiping: (e) => {
      if (!isSwiping) setIsSwiping(true);

      if (e.dir === 'Left' && Math.abs(shift) <= 110) setShift(e.deltaX < -110 ? -110 : e.deltaX);
      if (e.dir === 'Right') setShift((shift) => {
        const delta = shift + e.absX;
        return delta > 0 ? 0 : delta;
      });
    },
    onSwiped: () => {
      if (isSwiping) setIsSwiping(false);
      if (!swiped) setShift(0);
    }
  });

  const totalTimeSpent = useCalculateTimeValues(timeSpent);

  const handleClickOutsideButtons = () => {
    setShift(0);
    if (swiped) onCancelSwipe();
  };

  useOnClickOutside(ref, handleClickOutsideButtons, 'touchstart');

  const buttonWidth = Math.floor(Math.abs(shift) / 2);

  return (
    <div className="relative">
      <Card
        className={cn('w-full flex justify-between items-center mb-4 p-4 will-change-transform transition-transform duration-200 ease-in-out', {
          '-translate-x-[110px] rounded-r-none duration-200': swiped,
          'duration-0': isSwiping,
          'rounded-r-none': shift !== 0,
        })}
        style={isSwiping
          ? { 'transform': `translateX(${shift}px)`}
          : undefined
        }
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
            'px-0': !swiped,
            'border-none': shift === 0,
            'duration-0': isSwiping
          })}
          style={isSwiping
            ? { 'width': `${buttonWidth}px` }
            : undefined
          }
          variant="warning"
          onClick={() => console.log('edit')}
        >
          {(buttonWidth >= 30 || swiped) && <NotePencil size="30" />}
        </Button>
        <Button
          className={cn(`${buttonClassNames} rounded-r-md`, {
            'w-auto': swiped,
            'px-0': !swiped,
            'border-none': shift === 0,
            'duration-0': isSwiping
          })}
          style={isSwiping
            ? { 'width': `${buttonWidth}px` }
            : undefined
          }
          variant="destructive"
          onClick={() => console.log('delete')}
        >
          {(buttonWidth >= 30 || swiped) && <X size="30" />}
        </Button>
      </div>
    </div>
  );
};
