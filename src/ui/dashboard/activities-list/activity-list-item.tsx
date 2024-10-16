import { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { useSwipeable } from 'react-swipeable';

import {
  ActionButtons,
  BUTTONS_WIDTH,
} from '@/ui/dashboard/activities-list/activity-card/action-buttons';
import { ActivityCard } from '@/ui/dashboard/activities-list/activity-card/activity-card';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { cn } from '@/lib/utils';
import { ActivityExtended } from '@/lib/definitions';
import { ActionHandlers } from '@/ui/dashboard/activities-list/types';

export const ActivityListItem = ({
  activity,
  swiped,
  onSwipe,
  onCancelSwipe,
  onReorder,
  onEdit,
  onRemove,
}: {
  activity: ActivityExtended;
  swiped: boolean;
  onSwipe: (id: string) => void;
  onCancelSwipe: () => void;
} & ActionHandlers) => {
  const [shift, setShift] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (swiped) setShift(-BUTTONS_WIDTH);
  }, [swiped]);

  const { id, timeSpent } = activity;

  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe(id),
    onSwiping: (e) => {
      if (!isSwiping) setIsSwiping(true);
      if (e.dir === 'Left' && Math.abs(shift) <= BUTTONS_WIDTH)
        setShift(e.deltaX < -BUTTONS_WIDTH ? -BUTTONS_WIDTH : e.deltaX);
      if (e.dir === 'Right')
        setShift((shift) => {
          const delta = shift + e.absX;
          return delta > 0 ? 0 : delta;
        });
    },
    onSwiped: () => {
      const value = -shift;
      if (value >= BUTTONS_WIDTH / 2) setShift(-BUTTONS_WIDTH);
      if (value < BUTTONS_WIDTH / 2) setShift(0);
      if (isSwiping) setIsSwiping(false);
    },
  });

  const totalTimeSpent = useCalculateTimeValues(timeSpent);

  const handleClickOutsideButtons = () => {
    setShift(0);
    if (swiped) onCancelSwipe();
  };

  useOnClickOutside(ref, handleClickOutsideButtons, 'touchstart');

  const handleEdit = () => onEdit(id);
  const handleRemove = () => onRemove(id);

  return (
    <div
      className={cn(
        'mb-4 w-full transition-transform duration-300 ease-in-out will-change-transform',
        {
          'duration-0': isSwiping,
        },
      )}
      style={{transform: `translateX(${shift}px)`}}
      {...handlers}
    >
      <ActivityCard
        className={shift !== 0 ? 'rounded-r-none shadow-none' : ''}
        activity={activity}
        onReorder={onReorder}
        onEdit={handleEdit}
        onRemove={handleRemove}
      >
        <span className="text-accent-foreground">
          {`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}
        </span>
      </ActivityCard>

      <ActionButtons
        ref={ref}
        visibleWidth={-shift}
        applyTransition={!isSwiping}
        onReorder={onReorder}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />
    </div>
  );
};
