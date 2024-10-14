import { useEffect, useRef, useState, PointerEvent } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { useSwipeable } from 'react-swipeable';
import { Reorder, useDragControls } from 'framer-motion';

import { ActivityExtended } from '@/lib/definitions';
import { Card } from '@/ui/common/card';
import { PlayPauseButton } from '@/ui/dashboard/activities-list/activity-item/play-pause-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-icon';
import { ActivityDropdownMenu } from '@/ui/dashboard/activities-list/activity-item/activity-dropdown-menu';
import {
  ActionButtons,
  BUTTONS_WIDTH,
} from '@/ui/dashboard/activities-list/activity-item/action-buttons';
import { DragButton } from '@/ui/dashboard/activities-list/activity-item/drag-button';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { useRouter } from '@/ui/hooks/use-router';
import { cn } from '@/lib/utils';

export const ActivityItem = ({
  activity,
  swiped,
  showReorderButton,
  onReorderClick,
  onSwipe,
  onCancelSwipe,
}: {
  activity: ActivityExtended;
  swiped: boolean;
  showReorderButton: boolean;
  onReorderClick: () => void;
  onSwipe: (id: string) => void;
  onCancelSwipe: () => void;
}) => {
  const [shift, setShift] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (showReorderButton) {
      setShift(0);
      return;
    }
    if (swiped) setShift(-BUTTONS_WIDTH);
  }, [swiped, showReorderButton]);

  const { router, pathname, stringifyQueryParams } = useRouter();
  const { id, name, color, icon, timeSpent } = activity;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      onSwipe(id);
    },
    onSwiping: (e) => {
      if (showReorderButton) return;
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

  const handleEditClick = () =>
    router.push(`${pathname}?${stringifyQueryParams({ editActivity: id })}`);
  const handleRemoveClick = () =>
    router.push(`${pathname}?${stringifyQueryParams({ removeActivity: id })}`);

  const controls = useDragControls();
  const startDrag = (e: PointerEvent<HTMLButtonElement>) => controls.start(e);
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  return (
    <>
      <Reorder.Item
        value={activity}
        dragListener={false}
        dragControls={controls}
        onDragStart={handleDragStart}
        onDragTransitionEnd={handleDragEnd}
        className="relative"
      >
        <div
          className={cn(
            'mb-4 w-full transition-transform duration-300 ease-in-out will-change-transform',
            {
              'duration-0': isSwiping,
            },
          )}
          style={{ transform: isDragging ? 'none' : `translateX(${shift}px)` }}
          {...handlers}
        >
          <Card
            className={cn(
              'flex w-full flex-none items-center justify-between p-4',
              {
                'rounded-r-none shadow-none': shift !== 0,
                'cursor-grabbing [&_button]:cursor-grabbing': isDragging,
              },
            )}
          >
            <div className="flex max-w-[70%] flex-none items-center overflow-hidden">
              <PlayPauseButton className="flex-none" />
              <span className="mx-2 truncate font-semibold text-accent-foreground">
                {name}
              </span>
              <ActivityIcon
                className="flex-none"
                name={icon}
                color={`#${color}`}
              />
            </div>

            <div className="flex flex-none items-center">
              {showReorderButton ? (
                <DragButton onDragStart={startDrag} />
              ) : (
                <span className="text-accent-foreground">
                  {`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}
                </span>
              )}

              <ActivityDropdownMenu
                className="ml-2 hidden sm:inline-flex"
                onReorderClick={onReorderClick}
                onEditClick={handleEditClick}
                onRemoveClick={handleRemoveClick}
              />
            </div>
          </Card>

          <ActionButtons
            ref={ref}
            visibleWidth={-shift}
            applyTransition={!isSwiping}
            onReorderClick={onReorderClick}
            onEditClick={handleEditClick}
            onRemoveClick={handleRemoveClick}
          />
        </div>
      </Reorder.Item>
    </>
  );
};
