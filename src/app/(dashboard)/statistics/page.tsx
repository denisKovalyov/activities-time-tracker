import { TimeChart } from '@/ui/statistics/time-chart';
import {
  getActivitiesChartData,
  getDaysChartData,
  sumValues,
} from '@/ui/statistics/chart-data';
import { listActivities } from '@/lib/db/activities';
import { readTimeSnapshot } from '@/lib/db/time-entries';
import {
  type Day,
  addDays,
  getMonthStart,
  getWeekStart,
  toDay,
} from '@/lib/utils/day';
import { getUserId } from '@/lib/actions/utils/get-user-id';
import { getUserTimeZone } from '@/app/(dashboard)/next-api-helpers';

export default async function Statistics() {
  const userId = await getUserId();
  const timeZone = await getUserTimeZone();
  const now = new Date();
  const today = toDay(now, timeZone);
  const since = (from: Day) => ({ from, to: today, timeZone, now });

  const [activities, { timer, days, todayTotals, weekTotals, monthTotals }] =
    await Promise.all([
      listActivities(userId),
      // The charts add live time of the running timer on top of the totals
      readTimeSnapshot(userId, async (snapshot) => ({
        timer: await snapshot.runningTimer(),
        days: await snapshot.totalsByDay(since(addDays(today, -6))),
        todayTotals: await snapshot.totalsByActivity(since(today)),
        weekTotals: await snapshot.totalsByActivity(since(getWeekStart(today))),
        monthTotals: await snapshot.totalsByActivity(
          since(getMonthStart(today)),
        ),
      })),
    ]);

  const runningActivity =
    activities.find(({ id }) => id === timer?.activityId) ?? null;

  const charts = [
    { period: 'last7days', data: getDaysChartData(days) },
    { period: 'day', data: getActivitiesChartData(activities, todayTotals) },
    { period: 'week', data: getActivitiesChartData(activities, weekTotals) },
    { period: 'month', data: getActivitiesChartData(activities, monthTotals) },
  ] as const;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:gap-8 xl:h-full [&>div]:w-full [&>div]:sm:w-[calc(50%-0.5rem)] [&>div]:lg:w-[calc(50%-1rem)]">
      {charts.map(({ period, data }) => (
        <TimeChart
          key={period}
          period={period}
          data={data}
          total={sumValues(data)}
          timer={timer}
          countedAt={now.getTime()}
          runningActivity={runningActivity}
          today={today}
        />
      ))}
    </div>
  );
}
