'use client';

import { FolderOpen } from '@phosphor-icons/react';

import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { ActivitiesList } from '@/ui/dashboard/activities-list';
import { EmptyState } from '@/ui/common/empty-state';
import { useActivities } from '@/ui/providers/activities-provider';

export const DashboardWrapper = () => {
  const { activities, totalTimeSpent } = useActivities();

  return (
    <div className="flex h-full w-full flex-col">
      <ActivitiesHeader
        activities={activities}
        totalTimeSpent={totalTimeSpent}
      />

      {activities.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          text="You don't have any activities yet"
        />
      ) : (
        <ActivitiesList activities={activities} />
      )}
    </div>
  );
}
