import { useEffect, useEffectEvent, useState } from 'react';

import { reorderActivities } from '@/lib/actions/activities';
import type { Activity } from '@/lib/db/types';
import { getMoves } from '@/ui/dashboard/activities-list/reorder';
import { useToast } from '@/ui/hooks/use-toast';

// The list shown in the UI. In reorder mode it's changed locally while
// dragging and saved to the server when the user leaves reorder mode (or
// the page).
export const useActivitiesList = (
  activities: Activity[],
  reorderMode: boolean,
) => {
  const [activitiesList, setActivitiesList] = useState(activities);
  const [serverActivities, setServerActivities] = useState(activities);
  const { toast } = useToast();

  // New data from the server replaces the local list
  if (activities !== serverActivities) {
    setServerActivities(activities);
    setActivitiesList(activities);
  }

  const saveOrder = useEffectEvent(async () => {
    const moves = getMoves(
      activities.map(({ id }) => id),
      activitiesList.map(({ id }) => id),
    );
    if (!moves.length) return;

    const result = await reorderActivities(moves);
    toast({
      title: result.ok
        ? 'Activities order was successfully updated!'
        : result.message,
      variant: result.ok ? 'success' : 'destructive',
    });
    if (!result.ok) setActivitiesList(activities);
  });

  useEffect(() => {
    if (!reorderMode) return;

    window.addEventListener('beforeunload', saveOrder);
    return () => {
      window.removeEventListener('beforeunload', saveOrder);
      // Leaving reorder mode or the page
      void saveOrder();
    };
  }, [reorderMode]);

  return { activitiesList, setActivitiesList };
};
