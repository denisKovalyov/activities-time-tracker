import { auth } from '@/auth';
import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { AddActivityDialog } from '@/ui/dashboard/add-activity-dialog';
import { getActivities } from '@/lib/actions/activity';

export default async function ActivitiesList() {
  const session = await auth();
  console.log('session?.user?.id!', session?.user?.id!)
  const activities = await getActivities(session?.user?.id!);

  if ('message' in activities) return null;

  return (
    <div>
      <ActivitiesHeader activities={activities} />

      {activities.length === 0 ? (
        // TODO: Implement EmptyState component (icon + text)
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
