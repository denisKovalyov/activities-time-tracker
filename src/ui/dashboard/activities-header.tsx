import { Suspense } from 'react';
import { AddActivityButton } from '@/ui/dashboard/add-activity-button';
import { ActivityExtended } from '@/lib/definitions';
import { calculateTimeValues } from '@/lib/utils';

export const ActivitiesHeader = ({ activities }: { activities: ActivityExtended[] }) => {
  const totalTimeSpent = calculateTimeValues(activities.reduce(
    (acc, curr) => acc + (curr?.timeSpent || 0), 0));

  return (
    <div className="flex justify-between max-w-2xl w-full mx-auto">
      <div className="flex justify-center items-center w-full py-1 px-4 rounded-l-full bg-secondary dark:bg-background text-white font-bold truncate">
        {activities.length
          ? (<span>Time Spent:</span>)
          : (<span className="truncate">Add New Activity</span>)
        }
        </div>

      <div className="relative">
        <span className="absolute -left-2 box-content w-full h-full border-background px-2 rounded-full bg-background dark:bg-secondary" />
        <Suspense>
          <AddActivityButton />
        </Suspense>
      </div>

      <div className="flex justify-center items-center w-full py-1 px-4 rounded-r-full bg-secondary dark:bg-background text-white font-bold truncate">
        {activities.length
          ? (<span>{`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}</span>)
          : (<span className="truncate">To Start Using App</span>)
        }
      </div>
    </div>
  )
};
