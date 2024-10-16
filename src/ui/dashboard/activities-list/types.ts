import { ActivityExtended } from '@/lib/definitions';

export type ActivitiesListWrapperProps = {
  activities: ActivityExtended[];
}

export type ActionHandlers = {
  onReorder: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

export type ActivitiesListProps = ActivitiesListWrapperProps & ActionHandlers;
