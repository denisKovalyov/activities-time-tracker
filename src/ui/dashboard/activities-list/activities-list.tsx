'use client';

import { useEffect, useState } from 'react';
import { Reorder } from 'framer-motion';

import { ActivityItem } from '@/ui/dashboard/activities-list/activity-item/activityItem';
import { ActivityExtended } from '@/lib/definitions';

export const ActivitiesList = ({
  activities,
}: {
  activities: ActivityExtended[]
}) => {
  const [activitiesList, setActivitiesList] = useState<ActivityExtended[]>([]);
  const [swiped, setSwiped] = useState<string | null>(null);

  useEffect(() => {
    setActivitiesList(activities);
  }, [activities]);

  const handleSwipe = (id: string) => setSwiped(id);
  const handleSwipeCancel = () => setSwiped(() => null);

  return (
    <div className="w-full mt-4 max-w-3xl mx-auto overflow-x-hidden">
      <Reorder.Group
        onReorder={setActivitiesList}
        values={activitiesList}
        axis="y"
        layoutScroll
        style={{ overflowY: 'scroll', overflowX: 'hidden' }}
      >
        {activitiesList.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            swiped={swiped === activity.id}
            onSwipe={handleSwipe}
            onCancelSwipe={handleSwipeCancel}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
