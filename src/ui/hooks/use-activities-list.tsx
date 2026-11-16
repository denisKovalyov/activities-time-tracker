import { useOptimistic, useState, useTransition } from 'react';

import { reorderActivities } from '@/lib/actions/activities';
import type { Activity } from '@/lib/db/types';
import {
  getMoves,
  mergeVisibleOrder,
} from '@/ui/dashboard/activities-list/reorder';
import { useToast } from '@/ui/hooks/use-toast';

// While dragging, the list has the dragged order; after a drop, the new order
// is shown optimistically until it's saved. Moves are computed against the
// order from the server, so the next drag waits until the save finishes.
export const useActivitiesList = (activities: Activity[]) => {
  const [savingList, setSavingList] = useOptimistic(activities);
  const [draggedList, setDraggedList] = useState<Activity[] | null>(null);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  const activitiesList = draggedList ?? savingList;

  const handleReorder = (visibleReordered: Activity[]) =>
    setDraggedList(mergeVisibleOrder(activitiesList, visibleReordered));

  const handleDrop = () => {
    if (!draggedList) return;

    const moves = getMoves(
      activities.map(({ id }) => id),
      draggedList.map(({ id }) => id),
    );
    startTransition(async () => {
      setSavingList(draggedList);
      if (!moves.length) return;

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
