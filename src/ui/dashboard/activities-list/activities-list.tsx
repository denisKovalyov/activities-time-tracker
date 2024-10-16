import { useState } from 'react';

import { ActivityListItem } from '@/ui/dashboard/activities-list/activity-list-item';
import { ActivitiesListProps } from '@/ui/dashboard/activities-list/types';

export const ActivitiesList = ({
  activities,
  ...props
}: ActivitiesListProps) => {
  const [swiped, setSwiped] = useState<string | null>(null);
  const handleSwipe = (id: string) => setSwiped(id);
  const handleSwipeCancel = () => setSwiped(() => null);

  return (
    <>
      {activities.map((activity) => (
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
