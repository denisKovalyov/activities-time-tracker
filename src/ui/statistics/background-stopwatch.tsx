'use client';

import { useStopwatch } from '@/ui/hooks/use-stopwatch';
import { useRecord } from '@/ui/providers/record-provider';

const Stopwatch = ({ id }: { id: string; }) => {
  useStopwatch(id);
  return null;
}
export const BackgroundStopwatch = () => {
  const { activeId } = useRecord();

  return activeId ? (
    <Stopwatch id={activeId} />
  ) : null;
};
