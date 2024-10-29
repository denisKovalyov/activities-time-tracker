import { useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';

import { ReorderList } from '@/ui/dashboard/activities-list/reorder-list';
import { ActivitiesList } from '@/ui/dashboard/activities-list/activities-list';
import { useRouter } from '@/ui/hooks/use-router';
import { useActivities } from '@/ui/dashboard/providers/activities';
import { EmptyState } from '@/ui/common/empty-state';

export const ActivitiesListWrapper = () => {
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const { activitiesList  } = useActivities();
  const { router, pathname, searchParams, stringifyQueryParams } = useRouter();

  const handleReorder = () =>
    router.push(`${pathname}?${stringifyQueryParams({ reorder: 'true' })}`);
  const handleEdit = (id: string) =>
    router.push(`${pathname}?${stringifyQueryParams({ editActivity: id })}`);
  const handleRemove = (id: string) =>
    router.push(`${pathname}?${stringifyQueryParams({ removeActivity: id })}`);
  const handleRecord = (activityId: string) => {
    setRecordingId((id) => id === activityId ? null : activityId);
  }

  const reorderMode = Boolean(searchParams.get('reorder'));
  const List = reorderMode ? ReorderList : ActivitiesList;

  return (
    <div className="mx-auto mt-4 w-full h-full max-w-3xl overflow-x-hidden">
      {activitiesList.length === 0 ? (
          <EmptyState
            icon={MagnifyingGlass}
            text="No Activities Found"
          />
        ) : (
          <List
            activitiesList={activitiesList}
            recordingId={recordingId}
            onRecord={handleRecord}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
          />
        )}
    </div>
  );
};
