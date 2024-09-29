import { auth } from '@/auth';
import type { NextApiRequest } from 'next';
import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { AddActivityDialog } from '@/ui/dashboard/add-activity-dialog';
import { getActivities } from '@/lib/actions/activity';

export default async function ActivitiesList() {
  const session = await auth();
  const activities = await getActivities(session?.user?.id!);

  if ('message' in activities) return null;

  return (
    <div>
      <ActivitiesHeader activities={activities} />

      {activities.length === 0 ? (
        <span>{'You don\'t have any activities yet'}</span>
      ) : (
        <span>Activities length</span>
      )}

      <AddActivityDialog
        activitiesNumber={activities?.length || 0}
      />
    </div>
  );
}
