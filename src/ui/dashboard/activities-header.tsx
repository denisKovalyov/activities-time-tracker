import { Suspense } from 'react';
import { AddActivityButton } from '@/ui/dashboard/add-activity-button';
import { ActivityExtended } from '@/lib/definitions';
import { calculateTimeValues } from '@/lib/utils';

const headerBlockClasses = 'flex justify-center items-center w-full py-4 px-4 bg-primary text-white font-bold truncate';

export const ActivitiesHeader = ({ activities }: { activities: ActivityExtended[] }) => {
  const totalTimeSpent = calculateTimeValues(activities.reduce(
    (acc, curr) => acc + (curr?.timeSpent || 0), 0));

  return (
    <div className="flex justify-between max-w-2xl w-full mx-auto">
      <div className={`${headerBlockClasses} rounded-l-full`}>
        {activities.length
          ? (<span>Time Spent:</span>)
          : (<span className="truncate">Add New Activity</span>)
        }
        </div>

      <div className="relative">
        <span className="absolute -left-2 box-content w-full h-full px-2 rounded-full bg-muted" />
        <Suspense>
          <AddActivityButton />
        </Suspense>
      </div>

      <div className={`${headerBlockClasses} rounded-r-full`}>
        {activities.length
          ? (<span>{`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}</span>)
          : (<span className="truncate">To Start Using App</span>)
        }
      </div>
    </div>
  )
};
