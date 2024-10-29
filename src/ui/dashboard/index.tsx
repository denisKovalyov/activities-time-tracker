'use client';

import { FolderOpen } from '@phosphor-icons/react';

import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { ActivitiesProvider } from '@/ui/dashboard/providers/activities';
import { RecordProvider } from '@/ui/dashboard/providers/record';
import { ActivitiesListWrapper } from '@/ui/dashboard/activities-list';
import { EmptyState } from '@/ui/common/empty-state';
import { BackgroundStopwatch } from '@/ui/dashboard/background-stopwatch';
import { ProvidersWrapperProps } from '@/ui/dashboard/types';

export const ProvidersWrapper = ({
  activeActivity,
  activities,
  activitiesTimeMap,
  totalTimeSpent,
}: ProvidersWrapperProps) => {
  return (
    <div className="flex h-full w-full flex-col">
      <ActivitiesProvider
        activities={activities}
      >
        <RecordProvider
          activeActivity={activeActivity}
          activitiesMap={activitiesTimeMap}
          totalTimeSpent={totalTimeSpent}
        >
          <ActivitiesHeader
            activities={activities}
            dateStr={activeActivity?.[1]}
            totalTimeSpent={totalTimeSpent}
            activitiesNumber={activities.length}
          />
          {activities.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              text="You don't have any activities yet"
            />
          ) : (
            <ActivitiesListWrapper />
          )}
          <BackgroundStopwatch />
        </RecordProvider>
      </ActivitiesProvider>
    </div>
  );
}
