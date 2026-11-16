import type { Day } from '@/lib/utils/day';
import { RefreshOnNewDay } from '@/ui/layout/keep-data-fresh/refresh-on-new-day';
import { RefreshWhenVisible } from '@/ui/layout/keep-data-fresh/refresh-when-visible';

// Keeps the data rendered by the server up to date while the page stays open
export const KeepDataFresh = ({
  day,
  timeZone,
}: {
  day: Day;
  timeZone: string;
}) => (
  <>
    <RefreshWhenVisible />
    <RefreshOnNewDay day={day} timeZone={timeZone} />
  </>
);
