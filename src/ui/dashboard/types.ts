import { ActivityExtended, ActivityRecord}  from '@/lib/definitions';

export type ProvidersWrapperProps = {
  activeActivity: ActivityRecord['current_activity'] | null;
  currentActivity?: ActivityExtended;
  activities: ActivityExtended[];
  activitiesTimeMap: {[id: ActivityExtended['id']]: ActivityExtended['timeSpent']}
  totalTimeSpent: number;
}