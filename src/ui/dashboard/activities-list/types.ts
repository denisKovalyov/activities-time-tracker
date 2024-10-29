import { ActivityExtended } from '@/lib/definitions';

export type ActivitiesListProps = {
  activitiesList: ActivityExtended[];
  recordingId: string | null;
  onRecord: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: () => void;
};
