import { ActivityExtended, ActivityRecord } from '@/lib/definitions';

export type ActivitiesListWrapperProps = {
  activeActivity: ActivityRecord['current_activity'] | null;
  activities: ActivityExtended[];
  activitiesTimeMap: {[id: ActivityExtended['id']]: ActivityExtended['timeSpent']}
  totalTimeSpent: number;
}

export type ActivitiesListProps = {
  recordingId: string | null
  onRecord: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: () => void;
};
