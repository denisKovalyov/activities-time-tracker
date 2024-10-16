import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Reorder } from 'framer-motion';

import { useToast } from '@/ui/hooks/use-toast';
import { getReorderedActivities } from '@/ui/dashboard/activities-list/utils';
import { reorderActivities } from '@/lib/actions/activity';
import { refetchActivities } from '@/lib/actions/activity/app';
import { ActivityExtended } from '@/lib/definitions';
import { ActivitiesListProps } from '@/ui/dashboard/activities-list/types';
import { ReorderListItem } from '@/ui/dashboard/activities-list/reorder-list-item';

export const ReorderList = ({
  activities,
  ...props
}: ActivitiesListProps) => {
  const [activitiesList, setActivitiesList] = useState<ActivityExtended[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const { toast } = useToast();
  console.log('isReordering', isReordering)
  const debouncedReorder = useDebouncedCallback(
    async (activitiesListUpdated: ActivityExtended[]) => {
      setIsReordering(true);
      const diff = getReorderedActivities(activities, activitiesListUpdated);

      console.log('diff', diff);
      if (!diff.length) {
        setIsReordering(false);
        return;
      }

      const result = await reorderActivities(diff);

      if (result.success) {
        await refetchActivities();
      }

      setIsReordering(false);
      toast({
        title: result?.message || 'Activities order was successfully updated!',
        variant: result?.message ? 'destructive' : 'success',
      });
    }, 2000);

  useEffect(() => {
    if (!activitiesList.length) setActivitiesList(activities);
    return () => {
      debouncedReorder.flush();
    };
  }, [activities, debouncedReorder]);

  const handleReorder = useCallback(
    (activitiesReordered: ActivityExtended[]) => {
      setActivitiesList(activitiesReordered);
      void debouncedReorder(activitiesReordered);
    },
    [debouncedReorder],
  );

  return (
    <Reorder.Group
      onReorder={handleReorder}
      values={activitiesList}
      axis="y"
      layoutScroll
      style={{ overflowY: 'scroll', overflowX: 'hidden' }}
    >
      {activitiesList.map((activity, index) => (
        <ReorderListItem
          key={activity.id}
          activity={activity}
          {...props}
        />
      ))}
    </Reorder.Group>
  );
};
