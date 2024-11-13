import { ActivityExtended, ActivityRecord}  from '@/lib/definitions';

export type DashboardWrapperProps = {
  activeActivity: ActivityRecord['current_activity'] | null;
  activities: ActivityExtended[];
  activitiesTimeMap: {[id: ActivityExtended['id']]: ActivityExtended['timeSpent']}
  totalTimeSpent: number;
}
