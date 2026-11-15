import { TimeChart } from '@/ui/statistics/time-chart';
import {
  getActivitiesChartData,
  getDaysChartData,
  sumValues,
} from '@/ui/statistics/chart-data';
import { listActivities } from '@/lib/db/activities';
import { getTotalsByActivity, getTotalsByDay } from '@/lib/db/time-entries';
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
  // Totals are counted up to this moment; charts add live time on top
  const now = new Date();
  const today = toDay(now, timeZone);
  const since = (from: Day) => ({ from, to: today, timeZone, now });

  const [activities, days, todayTotals, weekTotals, monthTotals] =
    await Promise.all([
      listActivities(userId),
      getTotalsByDay(userId, since(addDays(today, -6))),
      getTotalsByActivity(userId, since(today)),
      getTotalsByActivity(userId, since(getWeekStart(today))),
      getTotalsByActivity(userId, since(getMonthStart(today))),
    ]);

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
          countedAt={now.getTime()}
          today={today}
        />
      ))}
    </div>
  );
}
