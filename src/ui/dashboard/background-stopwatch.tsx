import { useStopwatch } from '@/ui/hooks/use-stopwatch';
import { useRecord } from '@/ui/dashboard/providers/record';
import { useActivities } from '@/ui/dashboard/providers/activities';

const Stopwatch = ({ id }: { id: string; }) => {
  useStopwatch(id);
  return null;
}

export const BackgroundStopwatch = () => {
  const { activeId } = useRecord();
  const { activitiesList } = useActivities();

  const current = activitiesList.find(({ id }) => id === activeId);

  if (!activeId || current) return;

  return activeId ? (
    <Stopwatch id={activeId} />
  ) : null;
}
