'use client';

import { DialogWrapper } from '@/ui/common/dialog';
import { ActivityForm } from '@/ui/dashboard/activity-form/activity-form';
import { useRouter } from '@/ui/hooks/use-router';
import type { Activity } from '@/lib/db/types';

const ADD_ACTIVITY_SUBHEADER =
  'Create an Activity to Monitor and Optimize Your Time';
const EDIT_ACTIVITY_SUBHEADER = 'Edit Existing Activity';

export const ActivityDialog = ({ activities }: { activities: Activity[] }) => {
  const { router, pathname, searchParams } = useRouter();

  const addActivity = searchParams.get('addActivity');
  const editActivityId = searchParams.get('editActivity');
  const redirect = () => router.push(pathname);

  const showDialog = Boolean(addActivity || editActivityId);
  const header = addActivity ? 'Add Activity' : 'Edit Activity';
  const subheader = addActivity
    ? ADD_ACTIVITY_SUBHEADER
    : EDIT_ACTIVITY_SUBHEADER;

  // The action has already refreshed the data, only the dialog is closed
  const handleSubmit = redirect;

  return (
    <DialogWrapper
      show={showDialog}
      onOpenChange={redirect}
      header={
        <span className="prose-xl mb-4 text-center text-primary">{header}</span>
      }
      subheader={subheader}
      content={
        <ActivityForm
          activityId={editActivityId}
          activities={activities}
          onSubmit={handleSubmit}
        />
      }
    />
  );
};
