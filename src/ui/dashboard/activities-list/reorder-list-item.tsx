import { PointerEvent, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';

import { ActivityCard } from '@/ui/dashboard/activities-list/activity-card/activity-card';
import { DragButton } from '@/ui/dashboard/activities-list/activity-card/drag-button';
import { cn } from '@/lib/utils';
import { ActionHandlers } from '@/ui/dashboard/activities-list/types';
import { ActivityExtended } from '@/lib/definitions';

export const ReorderListItem = ({
  activity,
  onEdit,
  onRemove,
}: {
  activity: ActivityExtended;
} & ActionHandlers) => {
  const [isDragging, setIsDragging] = useState(false);

  const controls = useDragControls();
  const startDrag = (e: PointerEvent<HTMLButtonElement>) => controls.start(e);
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  const handleEdit = () => onEdit(activity.id);
  const handleRemove = () => onRemove(activity.id);

  return (
    <Reorder.Item
      value={activity}
      dragListener={false}
      dragControls={controls}
      onDragStart={handleDragStart}
      onDragTransitionEnd={handleDragEnd}
      className="relative mb-4"
    >
      <ActivityCard
        className={cn('animate-vertical-shake', {
          'cursor-grabbing [&_button]:cursor-grabbing': isDragging,
        })}
        activity={activity}
        onEdit={handleEdit}
        onRemove={handleRemove}
      >
        <DragButton onDragStart={startDrag}/>
      </ActivityCard>
    </Reorder.Item>
  );
};
