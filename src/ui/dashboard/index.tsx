'use client';

import { FolderOpen } from '@phosphor-icons/react';

import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { ActivitiesList } from '@/ui/dashboard/activities-list';
import { EmptyState } from '@/ui/common/empty-state';
import type { Activity } from '@/lib/db/types';

export const DashboardWrapper = ({
  activities,
}: {
  activities: Activity[];
}) => (
  <div className="flex h-full w-full flex-col">
    <ActivitiesHeader activities={activities} />

    {activities.length === 0 ? (
      <EmptyState icon={FolderOpen} text="You don't have any activities yet" />
    ) : (
      <ActivitiesList activities={activities} />
    )}
  </div>
);
