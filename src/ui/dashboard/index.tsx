'use client';

import { FolderOpen } from '@phosphor-icons/react';

import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { ActivitiesProvider } from '@/ui/dashboard/providers/activities';
import { RecordProvider } from '@/ui/dashboard/providers/record';
import { ActivitiesListWrapper } from '@/ui/dashboard/activities-list';
import { ProvidersWrapperProps } from '@/ui/dashboard/types';

export const ProvidersWrapper = ({
  activeActivity,
  currentActivity,
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
            activity={currentActivity}
            dateStr={activeActivity?.[1]}
            totalTimeSpent={totalTimeSpent}
            activitiesNumber={activities.length}
          />

          {activities.length === 0 ? (
            <div className="flex w-full flex-1">
              <div className="m-auto flex flex-col items-center">
                <FolderOpen
                  className="h-auto w-28 text-primary"
                  weight="duotone"
                />
                <h2 className="font-normal text-primary">
                  {"You don't have any activities yet"}
                </h2>
              </div>
            </div>
          ) : (
            <ActivitiesListWrapper />
          )}
        </RecordProvider>
      </ActivitiesProvider>
    </div>
  );
}
