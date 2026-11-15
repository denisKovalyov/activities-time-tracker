import { useState } from 'react';
import { useRouter } from '@/ui/hooks/use-router';
import { Reorder } from 'framer-motion';

import { ActivityListItem } from '@/ui/dashboard/activities-list/activity-list-item';
import { ActivitiesListProps } from '@/ui/dashboard/activities-list/types';
import { useActivitiesList } from '@/ui/hooks/use-activities-list';

export const ActivitiesList = ({ activities }: ActivitiesListProps) => {
  const [swiped, setSwiped] = useState<string | null>(null);

  const { router, pathname, searchParams, stringifyQueryParams } = useRouter();
  const reorderMode = Boolean(searchParams.get('reorder'));
  const search = searchParams.get('search')?.toLowerCase();

  const { activitiesList, handleReorder, handleDrop } =
    useActivitiesList(activities);

  const handleSwipe = (id: string) => setSwiped(id);
  const handleSwipeCancel = () => setSwiped(() => null);

  const handleReorderMode = () =>
    router.push(`${pathname}?${stringifyQueryParams({ reorder: 'true' })}`);

  const handleEdit = (id: string) =>
    router.push(`${pathname}?${stringifyQueryParams({ editActivity: id })}`);

  const handleRemove = (id: string) =>
    router.push(`${pathname}?${stringifyQueryParams({ removeActivity: id })}`);

  return (
    <div className="mx-auto mt-4 h-full w-full max-w-3xl overflow-x-hidden">
      <Reorder.Group
        onReorder={handleReorder}
        values={activitiesList}
        layoutScroll
      >
        {activitiesList.map((activity) => (
          <ActivityListItem
            key={activity.id}
            activity={activity}
            hidden={
              search ? !activity.name.toLowerCase().includes(search) : false
            }
            swiped={swiped === activity.id}
            reorderMode={reorderMode}
            onSwipe={handleSwipe}
            onCancelSwipe={handleSwipeCancel}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onReorder={handleReorderMode}
            onDrop={handleDrop}
          />
        ))}
      </Reorder.Group>
    </div>
  );
};
