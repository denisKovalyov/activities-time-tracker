'use client';

import { useState } from 'react';

import { ActivitiesListWrapperProps } from '@/ui/dashboard/activities-list/types';
import { ReorderList } from '@/ui/dashboard/activities-list/reorder-list';
import { ActivitiesList } from '@/ui/dashboard/activities-list/activities-list';
import { ActivitiesProvider } from '@/ui/dashboard/activities-list/providers/activities';
import { RecordProvider } from '@/ui/dashboard/activities-list/providers/record';
import { useRouter } from '@/ui/hooks/use-router';

export const ActivitiesListWrapper = ({
  activeActivity,
  activities,
  activitiesTimeMap,
  totalTimeSpent,
}: ActivitiesListWrapperProps) => {
  const [recordingId, setRecordingId] = useState<string | null>(null);
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
    <ActivitiesProvider
      activities={activities}
    >
      <RecordProvider
        activeActivity={activeActivity}
        activitiesMap={activitiesTimeMap}
        totalTimeSpent={totalTimeSpent}
      >
        <div className="mx-auto mt-4 w-full max-w-3xl overflow-x-hidden">
          <List
            recordingId={recordingId}
            onRecord={handleRecord}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onRemove={handleRemove}
          />
        </div>
      </RecordProvider>
    </ActivitiesProvider>
  );
};
