import { ActivityExtended } from '@/lib/definitions';

export type ActivitiesListItemProps = {
  recordingId: string | null;
  onRecord: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: () => void;
};

export type ActivitiesListProps = {
  activitiesList: ActivityExtended[];
} & ActivitiesListItemProps;
