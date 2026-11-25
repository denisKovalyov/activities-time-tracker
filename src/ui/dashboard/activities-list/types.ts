import type { Activity } from '@/lib/types';

export type ActivitiesListItemProps = {
  activity: Activity;
  hidden: boolean;
  swiped: boolean;
  onSwipe: (id: string) => void;
  onCancelSwipe: () => void;
  reorderMode: boolean;
  // While the previous drop is being saved
  dragDisabled: boolean;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: () => void;
  onDrop: () => void;
};

export type ActivitiesListProps = {
  activities: Activity[];
};
