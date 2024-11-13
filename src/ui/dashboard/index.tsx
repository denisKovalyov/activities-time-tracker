'use client';

import { FolderOpen } from '@phosphor-icons/react';

import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { RecordProvider } from '@/ui/dashboard/providers/record';
import { ActivitiesList } from '@/ui/dashboard/activities-list';
import { EmptyState } from '@/ui/common/empty-state';
import { DashboardWrapperProps } from '@/ui/dashboard/types';

export const DashboardWrapper = ({
  activeActivity,
  activities,
  activitiesTimeMap,
  totalTimeSpent,
}: DashboardWrapperProps) => {
  return (
    <div className="flex h-full w-full flex-col">
      <RecordProvider
        activeActivity={activeActivity}
        activitiesMap={activitiesTimeMap}
        totalTimeSpent={totalTimeSpent}
      >
        <ActivitiesHeader
          activities={activities}
          totalTimeSpent={totalTimeSpent}
          activitiesNumber={activities.length}
        />

        {activities.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            text="You don't have any activities yet"
          />
        ) : (
          <ActivitiesList
            activities={activities}
          />
        )}
      </RecordProvider>
    </div>
  );
}
