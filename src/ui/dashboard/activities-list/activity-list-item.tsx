import React, {
  PointerEvent,
  RefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { useSwipeable } from 'react-swipeable';
import { useLongPress } from 'use-long-press';
import { Reorder, useDragControls } from 'framer-motion';

import {
  ActionButtons,
  BUTTONS_WIDTH,
} from '@/ui/dashboard/activities-list/activity-card/action-buttons';
import { ActivityCard } from '@/ui/dashboard/activities-list/activity-card/activity-card';
import { DragButton } from '@/ui/dashboard/activities-list/activity-card/drag-button';
import { ActivityTime } from '@/ui/dashboard/activities-list/activity-card/activity-time';
import { useTimer } from '@/ui/timer/timer-provider';
import { ActivitiesListItemProps } from '@/ui/dashboard/activities-list/types';
import { cn, noop } from '@/lib/utils';

export const ActivityListItem = ({
  activity,
  hidden,
  swiped,
  onSwipe,
  onCancelSwipe,
  onReorder,
  onDrop,
  onEdit,
  onRemove,
  reorderMode,
}: ActivitiesListItemProps) => {
  const [shift, setShift] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { id } = activity;

  const { activeId, toggle } = useTimer();
  const isActive = activeId === id;

  useEffect(() => {
    if (swiped) setShift(-BUTTONS_WIDTH);
  }, [swiped]);

  useEffect(() => {
    if (reorderMode && shift !== 0) setShift(0);
  }, [shift, reorderMode]);

  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe(id),
    onSwiping: (e) => {
      if (reorderMode) return;
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

  const controls = useDragControls();
  const bindLongPress = useLongPress(isSwiping ? noop : onReorder);

  const handleClickOutsideButtons = () => {
    setShift(0);
    if (swiped) onCancelSwipe();
  };

  useOnClickOutside(
    ref as RefObject<HTMLDivElement>,
    handleClickOutsideButtons,
    'touchstart',
  );

  // Hidden by search. Rendered as nothing, not removed from the list, so
  // reordering keeps working with the full list.
  if (hidden) return null;

  const handleEdit = () => onEdit(id);
  const handleRemove = () => onRemove(id);
  const handleRecord = () => toggle(id);

  const startDrag = (e: PointerEvent<HTMLButtonElement>) => controls.start(e);
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  const renderItem = (children: ReactNode) =>
    reorderMode ? (
      <Reorder.Item
        value={activity}
        dragListener={false}
        dragControls={controls}
        onDragStart={handleDragStart}
        onDragEnd={onDrop}
        onDragTransitionEnd={handleDragEnd}
        className={cn({
          'relative z-10 shadow-[0_0_16px_0_rgba(14,35,70,0.35)]': isDragging,
        })}
      >
        {children}
      </Reorder.Item>
    ) : (
      children
    );

  return renderItem(
    <div
      className={cn(
        'mb-4 w-full transition-transform duration-300 ease-in-out will-change-transform',
        {
          'cursor-grabbing [&_button]:cursor-grabbing': isDragging,
          'duration-0': isSwiping || isDragging,
        },
      )}
      style={{ transform: `translateX(${shift}px)` }}
      {...handlers}
      {...bindLongPress()}
    >
      <ActivityCard
        className={shift !== 0 ? 'rounded-r-none shadow-none' : ''}
        activity={activity}
        isActive={isActive}
        onReorder={onReorder}
        onEdit={handleEdit}
        onRemove={handleRemove}
        onRecord={handleRecord}
      >
        {reorderMode ? (
          <DragButton onDragStart={startDrag} />
        ) : (
          <ActivityTime activityId={id} />
        )}
      </ActivityCard>

      <ActionButtons
        ref={ref}
        visibleWidth={-shift}
        applyTransition={!isSwiping}
        onReorder={onReorder}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />
    </div>,
  );
};
