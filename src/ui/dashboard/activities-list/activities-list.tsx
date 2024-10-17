import { useState } from 'react';

import { ActivityListItem } from '@/ui/dashboard/activities-list/activity-list-item';
import { ActivitiesListProps } from '@/ui/dashboard/activities-list/types';
import { useActivities } from '@/ui/dashboard/activities-list/activities-context';

export const ActivitiesList = ({
  ...props
}: ActivitiesListProps) => {
  const { activitiesList  } = useActivities();

  const [swiped, setSwiped] = useState<string | null>(null);
  const handleSwipe = (id: string) => setSwiped(id);
  const handleSwipeCancel = () => setSwiped(() => null);

  return (
    <>
      {activitiesList.map((activity) => (
        <ActivityListItem
          key={activity.id}
          activity={activity}
          swiped={swiped === activity.id}
          onSwipe={handleSwipe}
          onCancelSwipe={handleSwipeCancel}
          {...props}
        />
      ))}
    </>
  );
};
