import { useState, useEffect } from 'react';
import { useRouter } from '@/ui/hooks/use-router';
import { Reorder } from 'framer-motion';

import { ActivityListItem } from '@/ui/dashboard/activities-list/activity-list-item';
import { ActivitiesListProps } from '@/ui/dashboard/activities-list/types';
import { useActivities } from '@/ui/hooks/use-activities';

export const ActivitiesList = ({
  activities,
}: ActivitiesListProps) => {
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [swiped, setSwiped] = useState<string | null>(null);

  const { router, pathname, searchParams, stringifyQueryParams } = useRouter();
  const { activitiesList, handleReorder, handleReorderDebounced } = useActivities(activities);

  useEffect(() => {
    window.addEventListener('beforeunload', handleReorder);
    return () => {
      window.removeEventListener('beforeunload', handleReorder);
    };
  }, [handleReorder]);

  const handleSwipe = (id: string) => setSwiped(id);
  const handleSwipeCancel = () => setSwiped(() => null);

  const handleReorderMode = () =>
    router.push(`${pathname}?${stringifyQueryParams({ reorder: 'true' })}`);

  const handleEdit = (id: string) =>
    router.push(`${pathname}?${stringifyQueryParams({ editActivity: id })}`);

  const handleRemove = (id: string) =>
    router.push(`${pathname}?${stringifyQueryParams({ removeActivity: id })}`);

  const handleRecord = (activityId: string) => {
    setRecordingId((id) => id === activityId ? null : activityId);
  }

  const reorderMode = Boolean(searchParams.get('reorder'));

  return (
    <div className="mx-auto mt-4 w-full h-full max-w-3xl overflow-x-hidden">
      <Reorder.Group
        onReorder={handleReorderDebounced}
        values={activitiesList}
        layoutScroll
        style={{ overflowY: 'scroll', overflowX: 'hidden' }}
      >
        {activitiesList.map((activity) => (
          <ActivityListItem
            key={activity.id}
            activity={activity}
            recordingId={recordingId}
            swiped={swiped === activity.id}
            reorderMode={reorderMode}
            onSwipe={handleSwipe}
            onCancelSwipe={handleSwipeCancel}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onRecord={handleRecord}
            onReorder={handleReorderMode}
          />
        ))}
      </Reorder.Group>
    </div>
  );
};
