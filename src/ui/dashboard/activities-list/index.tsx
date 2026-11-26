import { useState } from 'react';
import { useRouter } from '@/ui/hooks/use-router';
import { Reorder } from 'framer-motion';

import { ActivityListItem } from '@/ui/dashboard/activities-list/activity-list-item';
import { useActivitiesList } from '@/ui/hooks/use-activities-list';
import type { Activity } from '@/lib/types';

export const ActivitiesList = ({ activities }: { activities: Activity[] }) => {
  const [swiped, setSwiped] = useState<string | null>(null);

  const { router, pathname, searchParams, stringifyQueryParams } = useRouter();
  const reorderMode = Boolean(searchParams.get('reorder'));
  const search = searchParams.get('search')?.toLowerCase();

  const { activitiesList, isSaving, handleReorder, handleDrop } =
    useActivitiesList(activities);

  const visibleActivities = search
    ? activitiesList.filter(({ name }) => name.toLowerCase().includes(search))
    : activitiesList;

  const handleSwipe = (id: string) => setSwiped(id);
  const handleSwipeCancel = () => setSwiped(() => null);

  // Activities are reordered in the full list, so the search is cleared
  const handleReorderMode = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.set('reorder', 'true');
    router.push(`${pathname}?${params}`);
  };

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
        {visibleActivities.map((activity) => (
          <ActivityListItem
            key={activity.id}
            activity={activity}
            swiped={swiped === activity.id}
            reorderMode={reorderMode}
            dragDisabled={isSaving}
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
