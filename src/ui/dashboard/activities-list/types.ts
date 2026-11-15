import type { Activity } from '@/lib/db/types';

export type ActivitiesListItemProps = {
  activity: Activity;
  hidden: boolean;
  swiped: boolean;
  onSwipe: (id: string) => void;
  onCancelSwipe: () => void;
  reorderMode: boolean;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: () => void;
};

export type ActivitiesListProps = {
  activities: Activity[];
};
