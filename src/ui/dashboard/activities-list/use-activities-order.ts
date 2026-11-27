import { useOptimistic, useState, useTransition } from 'react';

import { reorderActivities } from '@/lib/actions/activities';
import type { Activity } from '@/lib/types';
import { getMoves } from '@/ui/dashboard/activities-list/reorder';
import { toast } from '@/ui/hooks/use-toast';

// Shows the new activities order right away: while dragging and after a drop
// until the server saves it
export const useActivitiesOrder = (activities: Activity[]) => {
  const [optimisticList, setOptimisticList] = useOptimistic(activities);
  const [draggedList, setDraggedList] = useState<Activity[] | null>(null);
  const [isSaving, startTransition] = useTransition();

  const activitiesList = draggedList ?? optimisticList;

  const handleReorder = (reordered: Activity[]) => setDraggedList(reordered);

  const handleDrop = () => {
    if (!draggedList) return;

    const moves = getMoves(
      activities.map(({ id }) => id),
      draggedList.map(({ id }) => id),
    );
    startTransition(async () => {
      setOptimisticList(draggedList);
      if (!moves.length) return;

      // Revalidates the activities, so the saved order comes back through the
      // `activities` param and replaces the optimistic one
      const result = await reorderActivities(moves).catch(() => null);
      if (!result?.ok) {
        toast({
          title: result?.message ?? "Activities order wasn't saved.",
          variant: 'destructive',
        });
      }
    });
    setDraggedList(null);
  };

  return { activitiesList, isSaving, handleReorder, handleDrop };
};
