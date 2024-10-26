import { useState } from 'react';

import { ActivityListItem } from '@/ui/dashboard/activities-list/activity-list-item';
import { useActivities } from '@/ui/dashboard/providers/activities';
import { ActivitiesListProps } from '@/ui/dashboard/activities-list/types';

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
