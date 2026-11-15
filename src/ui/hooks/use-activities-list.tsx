import { useRef, useState } from 'react';

import { reorderActivities } from '@/lib/actions/activities';
import type { Activity } from '@/lib/db/types';
import {
  getMoves,
  mergeVisibleOrder,
} from '@/ui/dashboard/activities-list/reorder';
import { useToast } from '@/ui/hooks/use-toast';

// The list shown in the UI. While dragging it's changed only locally; when
// an activity is dropped, the new order is saved right away.
export const useActivitiesList = (activities: Activity[]) => {
  const [activitiesList, setActivitiesList] = useState(activities);
  const [serverActivities, setServerActivities] = useState(activities);
  // The order made by the current drag, saved when the activity is dropped
  const draggedList = useRef<Activity[] | null>(null);
  const { toast } = useToast();

  // New data from the server replaces the local list
  if (activities !== serverActivities) {
    setServerActivities(activities);
    setActivitiesList(activities);
  }

  const handleReorder = (visibleReordered: Activity[]) => {
    const list = mergeVisibleOrder(activitiesList, visibleReordered);
    draggedList.current = list;
    setActivitiesList(list);
  };

  // Moves are computed against the last order from the server. If another
  // drop comes before the server answers, its moves repeat the previous
  // ones, which gives the same result.
  const handleDrop = async () => {
    const list = draggedList.current;
    draggedList.current = null;
    if (!list) return;

    const moves = getMoves(
      activities.map(({ id }) => id),
      list.map(({ id }) => id),
    );
    if (!moves.length) return;

    const result = await reorderActivities(moves).catch(() => null);
    if (!result?.ok) {
      toast({
        title: result?.message ?? "Activities order wasn't saved.",
        variant: 'destructive',
      });
      setActivitiesList(activities);
    }
  };

  return { activitiesList, handleReorder, handleDrop };
};
