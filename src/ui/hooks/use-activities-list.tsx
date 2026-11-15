import { useOptimistic, useState, useTransition } from 'react';

import { reorderActivities } from '@/lib/actions/activities';
import type { Activity } from '@/lib/db/types';
import {
  getMoves,
  mergeVisibleOrder,
} from '@/ui/dashboard/activities-list/reorder';
import { useToast } from '@/ui/hooks/use-toast';

// The list shown in the UI:
// - while dragging, the order made by the drag (local only);
// - after a drop, the new order is shown optimistically while it's being
//   saved. React keeps it until the save and the re-render with fresh data
//   finish, so data that arrives meanwhile (e.g. after leaving reorder mode)
//   can't bring the old order back. If the save fails, the order from the
//   server is shown again.
// A new drag can't start until the save finishes: its moves are computed
// against the order from the server, which must already include the
// previous drop.
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
    const list = draggedList;

    startTransition(async () => {
      setSavingList(list);
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
