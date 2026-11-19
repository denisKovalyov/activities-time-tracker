import { ActivityDialog } from '@/ui/dashboard/activity-dialog';
import { RemoveActivityDialog } from '@/ui/dashboard/remove-activity-dialog';
import { DashboardWrapper } from '@/ui/dashboard';
import { TimerProvider } from '@/ui/timer/timer-provider';
import { listActivities } from '@/lib/db/activities';
import { readTimeSnapshot } from '@/lib/db/time-entries';
import { toDay } from '@/lib/utils/day';
import { getUserId } from '@/lib/actions/utils/get-user-id';
import { getUserTimeZone } from '@/app/(content)/next-api-helpers';

export default async function Activities() {
  const userId = await getUserId();
  const timeZone = await getUserTimeZone();
  // The client adds live time of the running timer on top of the totals
  const now = new Date();
  const today = toDay(now, timeZone);

  const [activities, { timer, totals }] = await Promise.all([
    listActivities(userId),
    readTimeSnapshot(userId, async (snapshot) => ({
      timer: await snapshot.runningTimer(),
      totals: await snapshot.totalsByActivity({
        from: today,
        to: today,
        timeZone,
        now,
      }),
    })),
  ]);

  return (
    <TimerProvider timer={timer} totals={totals} countedAt={now.getTime()}>
      <DashboardWrapper activities={activities} />
      <ActivityDialog activities={activities} />
      <RemoveActivityDialog activities={activities} />
    </TimerProvider>
  );
}
