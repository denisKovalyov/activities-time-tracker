'use client';

import { DialogWrapper } from '@/ui/common/dialog';
import { ActivityForm } from '@/ui/dashboard/activity-form/activity-form';
import { ActivityExtended } from '@/lib/definitions';
import { useRouter } from '@/ui/hooks/use-router';
import { goToActivitiesPage, refetchActivities } from '@/lib/actions/activity/next-api';

const ADD_ACTIVITY_SUBHEADER =
  'Create an Activity to Monitor and Optimize Your Time';
const EDIT_ACTIVITY_SUBHEADER = 'Edit Existing Activity';

export const ActivityDialog = ({
  activities,
}: {
  activities: ActivityExtended[];
}) => {
  const { router, pathname, searchParams } = useRouter();

  const addActivity = searchParams.get('addActivity');
  const editActivityId = searchParams.get('editActivity');
  const redirect = () => router.push(pathname);

  const showDialog = Boolean(addActivity || editActivityId);
  const header = addActivity ? 'Add Activity' : 'Edit Activity';
  const subheader = addActivity
    ? ADD_ACTIVITY_SUBHEADER
    : EDIT_ACTIVITY_SUBHEADER;

  const handleSubmit = async () => {
    await refetchActivities();
    void goToActivitiesPage();
  }

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
