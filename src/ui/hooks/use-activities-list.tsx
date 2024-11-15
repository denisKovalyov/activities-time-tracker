import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { reorderActivities } from '@/lib/actions/activity';
import { getReorderedActivities, isListHasChanged } from '@/ui/dashboard/activities-list/utils';
import { useToast } from '@/ui/hooks/use-toast';
import { useRouter } from '@/ui/hooks/use-router';
import { ActivityExtended } from '@/lib/definitions';

const DEBOUNCE_DELAY = 2000;

type UseActivitiesList = {
  activitiesList: ActivityExtended[];
  handleReorder: () => void;
  handleReorderDebounced: (activitiesList: ActivityExtended[]) => void;
}

export const useActivitiesList = (activities: ActivityExtended[]): UseActivitiesList => {
  const [activitiesList, setActivitiesList] =
    useState<(ActivityExtended & { hidden?: boolean })[]>(activities);
  const [previousList, setPreviousList] = useState<ActivityExtended[]>([]);

  useEffect(() => {
    if (isListHasChanged(previousList, activities)) {
      setActivitiesList(activities);
      setPreviousList(activities);
    }
  }, [activities, previousList, setActivitiesList, setPreviousList]);

  const { toast } = useToast();

  const { searchParams } = useRouter();
  const search = searchParams.get('search')?.toLowerCase();

  useEffect(() => {
    setActivitiesList((activitiesList) => activitiesList.map((activity) => {
      return {
        ...activity,
        hidden: search ? !activity.name.toLowerCase().includes(search) : false,
      };
    }));
  }, [search, setActivitiesList]);


  const reorderActivitiesList = async (updatedActivities: ActivityExtended[]) => {
    const diff = getReorderedActivities(activities, updatedActivities);

    if (!diff.length) return;

    const result = await reorderActivities(diff);

    toast({
      title: 'message' in result ? result.message : 'Activities order was successfully updated!',
      variant: 'message' in result ? 'destructive' : 'success',
    });
  };

  const debouncedReorder = useDebouncedCallback(reorderActivitiesList, DEBOUNCE_DELAY);

  const handleReorderDebounced = useCallback(
    (activitiesReordered: ActivityExtended[]) => {
      setActivitiesList(activitiesReordered);
      void debouncedReorder(activitiesReordered);
    },
    [debouncedReorder],
  );

  const handleReorder = useCallback(
    () => debouncedReorder.flush(),
    [debouncedReorder],
  );

  const list = useMemo(() => activitiesList.filter(({ hidden }) => !hidden), [activitiesList]);

  return {
    activitiesList: list,
    handleReorderDebounced,
    handleReorder,
  };
};
