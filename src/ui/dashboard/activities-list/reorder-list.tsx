import { useEffect } from 'react';
import { Reorder } from 'framer-motion';

import { ActivitiesListProps } from '@/ui/dashboard/activities-list/types';
import { ReorderListItem } from '@/ui/dashboard/activities-list/reorder-list-item';
import { useActivities } from '@/ui/dashboard/activities-list/activities-context';

export const ReorderList = ({
  ...props
}: ActivitiesListProps) => {
  const {
    activitiesList,
    handleReorder,
    handleReorderDebounced,
  } = useActivities();

  useEffect(() => {
    return () => handleReorder();
  }, [handleReorder]);

  return (
    <Reorder.Group
      onReorder={handleReorderDebounced}
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
