import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { ActivityExtended } from '@/lib/definitions';
import { reorderActivities } from '@/lib/actions/activity';
import { refetchActivities } from '@/lib/actions/activity/app';
import {getLatestUpdateTimestamp, getReorderedActivities} from '@/ui/dashboard/activities-list/utils';
import { useToast } from '@/ui/hooks/use-toast';

interface ActivitiesContextProps {
  activitiesList: ActivityExtended[];
  handleReorder: () => void;
  handleReorderDebounced: (activitiesList: ActivityExtended[]) => void;
}

export const ActivitiesContext = createContext<ActivitiesContextProps>({
  activitiesList: [],
  handleReorder: () => {},
  handleReorderDebounced: () => {},
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
  const [latestUpdate, setLatestUpdate] = useState(0);

  useEffect(() => {
    const timestamp = getLatestUpdateTimestamp(activities);

    if (timestamp > latestUpdate) {
      setLatestUpdate(timestamp);
      setActivitiesList(activities);
    }
  }, [activities, latestUpdate]);

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

  const debouncedReorder = useDebouncedCallback(reorderActivitiesList, 2000);

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
    <ActivitiesContext.Provider
      value={{
        activitiesList,
        handleReorderDebounced,
        handleReorder,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
};

export const ActivitiesProvider = React.memo(ActivitiesProviderComponent);
