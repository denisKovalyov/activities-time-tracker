import { ActivityItem } from '@/ui/dashboard/activities-list/activity-item';
import { Activity } from '@/lib/definitions';

export const ActivitiesList = ({
  activities,
}: {
  activities: Activity[]
}) => (
  <div className="py-4 w-full max-w-3xl mx-auto">
    {activities.map((activity) => (
      <ActivityItem key={activity.id} activity={activity} />
    ))}
  </div>
);
