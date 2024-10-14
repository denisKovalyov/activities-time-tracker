import { auth } from '@/auth';
import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { ActivityDialog } from '@/ui/dashboard/activity-dialog';
import { RemoveActivityDialog } from '@/ui/dashboard/remove-activity-dialog';
import { ActivitiesList } from '@/ui/dashboard/activities-list/activities-list';
import { getActivities } from '@/lib/actions/activity';
import { FolderOpen } from '@phosphor-icons/react/dist/ssr';

export default async function Activities() {
  const session = await auth();
  const activities = await getActivities(session?.user?.id!);

  if ('message' in activities) return null;

  return (
    <>
      <div className="flex h-full w-full flex-col">
        <ActivitiesHeader activities={activities} />

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
          <ActivitiesList activities={activities} />
        )}
      </div>

      <ActivityDialog activities={activities} />
      <RemoveActivityDialog activities={activities} />
    </>
  );
}
