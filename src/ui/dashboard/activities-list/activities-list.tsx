'use client';

import { useState } from 'react';
import { ActivityItem } from '@/ui/dashboard/activities-list/activity-item';
import { ActivityExtended } from '@/lib/definitions';

export const ActivitiesList = ({
  activities,
}: {
  activities: ActivityExtended[]
}) => {
  const [swiped, setSwiped] = useState<string | null>(null);

  const handleSwipe = (id: string) => setSwiped(id);
  const handleSwipeCancel = () => setSwiped(() => null);

  return (
    <div className="py-4 w-full max-w-3xl mx-auto overflow-hidden">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          swiped={swiped === activity.id}
          onSwipe={handleSwipe}
          onCancelSwipe={handleSwipeCancel}
        />
      ))}
    </div>
  );
}