'use client';

import { useEffect, useState } from 'react';
import { Reorder } from 'framer-motion';

import { ActivityItem } from '@/ui/dashboard/activities-list/activity-item';
import { ActivityExtended } from '@/lib/definitions';
import { Skeleton } from '@/ui/common/skeleton';
import { Card } from '@/ui/common/card';
import { useRouter } from '@/ui/hooks/use-router';

export const ActivitiesList = ({
  activities,
}: {
  activities: ActivityExtended[];
}) => {
  const { router, pathname, searchParams, stringifyQueryParams } = useRouter();

  const [activitiesList, setActivitiesList] = useState<ActivityExtended[]>([]);
  const [swiped, setSwiped] = useState<string | null>(null);

  useEffect(() => {
    setActivitiesList(activities);
  }, [activities]);

  const handleSwipe = (id: string) => setSwiped(id);
  const handleSwipeCancel = () => setSwiped(() => null);
  const handleReorderMode = () =>
    router.push(`${pathname}?${stringifyQueryParams({ reorder: 'true' })}`);

  const reorderMode = Boolean(searchParams.get('reorder'));

  return (
    <div className="mx-auto mt-4 w-full max-w-3xl overflow-x-hidden">
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
            showReorderButton={reorderMode}
            onReorderClick={handleReorderMode}
            onSwipe={handleSwipe}
            onCancelSwipe={handleSwipeCancel}
          />
        ))}
      </Reorder.Group>
    </div>
  );
};

export const ActivitiesListSkeleton = () => (
  <div className="mx-auto mt-4 w-full max-w-3xl">
    {new Array(3).fill(null).map((_, index) => (
      <Card
        key={index}
        className="mb-4 flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="mx-2 h-6 w-[100px]" />
          <Skeleton className="h-5 w-5" />
        </div>

        <Skeleton className="h-5 w-5 " />

        <div className="flex flex-none items-center">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="m-2 ml-6 hidden h-5 w-5 rounded-full sm:inline-flex" />
        </div>
      </Card>
    ))}
  </div>
);
