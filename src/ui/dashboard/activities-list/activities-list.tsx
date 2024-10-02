import { ActivityItem } from '@/ui/dashboard/activities-list/activity-item';
import { ActivityExtended } from '@/lib/definitions';

export const ActivitiesList = ({
  activities,
}: {
  activities: ActivityExtended[]
}) => (
  <div className="py-4 w-full max-w-3xl mx-auto">
    {activities.map((activity) => (
      <ActivityItem key={activity.id} activity={activity} />
    ))}
  </div>
);
