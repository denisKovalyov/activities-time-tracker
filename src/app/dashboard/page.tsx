import { auth } from '@/auth';
import { ActivitiesHeader } from '@/ui/dashboard/activities-header';
import { AddActivityDialog } from '@/ui/dashboard/add-activity-dialog';
import { getActivities } from '@/lib/actions/activity';
import { FolderOpen } from '@phosphor-icons/react/dist/ssr';

export default async function ActivitiesList() {
  const session = await auth();
  console.log('session?.user?.id!', session?.user?.id!)
  const activities = await getActivities(session?.user?.id!);

  if ('message' in activities) return null;

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <ActivitiesHeader activities={activities}/>

        {activities.length !== 0 ? (
          <div className="w-full flex-1 flex">
            <div className="m-auto flex flex-col items-center">
              <FolderOpen className="w-28 h-auto text-primary" weight="duotone" />
              <h2 className="font-normal text-primary">{'You don\'t have any activities yet'}</h2>
            </div>
          </div>
        ) : (
          <span>Activities length</span>
        )}
      </div>

      <AddActivityDialog
        activitiesNumber={activities?.length || 0}
      />
    </>
  );
}
