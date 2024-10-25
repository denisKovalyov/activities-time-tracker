import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { ActivityExtended } from '@/lib/definitions';
import { reorderActivities } from '@/lib/actions/activity';
import { refetchActivities } from '@/lib/actions/activity/next-api';
import { getReorderedActivities, isListHasChanged } from '@/ui/dashboard/activities-list/utils';
import { useToast } from '@/ui/hooks/use-toast';
import { noop } from '@/lib/utils';

const DEBOUNCE_DELAY = 2000;

interface ActivitiesContextProps {
  activitiesList: ActivityExtended[];
  handleReorder: () => void;
  handleReorderDebounced: (activitiesList: ActivityExtended[]) => void;
}

export const Activities = createContext<ActivitiesContextProps>({
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
    useState<ActivityExtended[]>(activities);
  const [previousList, setPreviousList] = useState<ActivityExtended[]>([]);

  if (isListHasChanged(previousList, activities)) {
    setActivitiesList(activities);
    setPreviousList(activities);
  }

  const { toast } = useToast();

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

  return (
    <Activities.Provider
      value={{
        activitiesList,
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
