export type ActivitiesListProps = {
  recordingId: string | null
  onRecord: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: () => void;
};
