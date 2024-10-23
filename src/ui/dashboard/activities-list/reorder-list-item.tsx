import { PointerEvent, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';

import { ActivityCard } from '@/ui/dashboard/activities-list/activity-card/activity-card';
import { DragButton } from '@/ui/dashboard/activities-list/activity-card/drag-button';
import { ActivitiesListProps } from '@/ui/dashboard/activities-list/types';
import { ActivityExtended } from '@/lib/definitions';
import { useRecord } from '@/ui/dashboard/activities-list/providers/record';
import { cn } from '@/lib/utils';

export const ReorderListItem = ({
  activity,
  onEdit,
  onRemove,
}: {
  activity: ActivityExtended;
} & ActivitiesListProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const controls = useDragControls();
  const {
    activeActivityId,
    onRecord,
  } = useRecord();

  const { id } = activity;

  const startDrag = (e: PointerEvent<HTMLButtonElement>) => controls.start(e);
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  const handleEdit = () => onEdit(id);
  const handleRemove = () => onRemove(id);
  const handleRecord = () => onRecord(id);

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
        isRunning={activeActivityId === id}
        onEdit={handleEdit}
        onRemove={handleRemove}
        onRecord={handleRecord}
      >
        <DragButton onDragStart={startDrag}/>
      </ActivityCard>
    </Reorder.Item>
  );
};
