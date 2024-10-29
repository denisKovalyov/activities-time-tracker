import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { ActivityExtended } from '@/lib/definitions';
import { reorderActivities } from '@/lib/actions/activity';
import { refetchActivities } from '@/lib/actions/activity/next-api';
import { getReorderedActivities, isListHasChanged } from '@/ui/dashboard/activities-list/utils';
import { useToast } from '@/ui/hooks/use-toast';
import { useRouter } from '@/ui/hooks/use-router';
import { noop } from '@/lib/utils';

const DEBOUNCE_DELAY = 2000;

interface ActivitiesContextProps {
  activitiesList: ActivityExtended[];
  handleReorder: () => void;
  handleReorderDebounced: (activitiesList: ActivityExtended[]) => void;
}

const Activities = createContext<ActivitiesContextProps>({
  activitiesList: [],
  handleReorder: noop,
  handleReorderDebounced: noop,
});

export const ActivitiesProviderComponent: React.FC<{
  activities: ActivityExtended[];
  children: ReactNode;
}> = ({
  activities,
  children,
}) => {
  const [activitiesList, setActivitiesList] =
    useState<(ActivityExtended & { hidden?: boolean })[]>(activities);
  const [previousList, setPreviousList] = useState<ActivityExtended[]>([]);

  if (isListHasChanged(previousList, activities)) {
    setActivitiesList(activities);
    setPreviousList(activities);
  }

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

    if (result.success) {
      await refetchActivities();
    }

    toast({
      title: result?.message || 'Activities order was successfully updated!',
      variant: result?.message ? 'destructive' : 'success',
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

  return (
    <Activities.Provider
      value={{
        activitiesList: list,
        handleReorderDebounced,
        handleReorder,
      }}
    >
      {children}
    </Activities.Provider>
  );
};

export const useActivities = () => {
  const context = useContext(Activities);
  if (!context) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
};

export const ActivitiesProvider = React.memo(ActivitiesProviderComponent);
