import { auth } from '@/auth';
import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { AddActivityDialog } from '@/ui/dashboard/add-activity-dialog';
import { ActivitiesList } from '@/ui/dashboard/activities-list/activities-list';
import { getActivities } from '@/lib/actions/activity';
import { FolderOpen } from '@phosphor-icons/react/dist/ssr';

export default async function Activities() {
  const session = await auth();
  const activities = await getActivities(session?.user?.id!);

  if (activities.message) return null;

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <ActivitiesHeader activities={activities} />

        {activities.length === 0 ? (
          <div className="w-full flex-1 flex">
            <div className="m-auto flex flex-col items-center">
              <FolderOpen className="w-28 h-auto text-primary" weight="duotone" />
              <h2 className="font-normal text-primary">{'You don\'t have any activities yet'}</h2>
            </div>
          </div>
        ) : (
          <ActivitiesList activities={activities} />
        )}
      </div>

      <AddActivityDialog activities={activities} />
    </>
  );
}
