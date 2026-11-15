import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { useActivitySeconds } from '@/ui/timer/timer-provider';

// A separate component, so only it re-renders every second while the
// activity's timer is running, not the whole list item.
export const ActivityTime = ({ activityId }: { activityId: string }) => {
  const [hours, minutes, seconds] = useCalculateTimeValues(
    useActivitySeconds(activityId),
  );

  return (
    <span className="text-accent-foreground" suppressHydrationWarning>
      {`${hours}:${minutes}:${seconds}`}
    </span>
  );
};
