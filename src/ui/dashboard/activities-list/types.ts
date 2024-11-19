import { ActivityExtended } from '@/lib/definitions';

export type ActivitiesListItemProps = {
  activity: ActivityExtended & { hidden?: boolean };
  swiped: boolean;
  onSwipe: (id: string) => void;
  onCancelSwipe: () => void;
  reorderMode: boolean;
  recordingId: string | null;
  onRecord: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: () => void;
};

export type ActivitiesListProps = {
  activities: ActivityExtended[];
};
