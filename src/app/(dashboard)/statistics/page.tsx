import { auth } from '@/auth';

import { TimeChart } from '@/ui/statistics/time-chart';
import { BackgroundStopwatch } from '@/ui/statistics/background-stopwatch';
import { getActivities, getActivitiesRange } from '@/lib/actions/activity';
import { retrieveDateFromCookies } from '@/app/(dashboard)/next-api-helpers';
import {
  getTotalTimeSpent,
  getWeekStartDate,
  getMonthStartDate,
  prepareChartData,
  formatReadableDate,
} from '@/lib/utils';

export default async function Statistics() {
  const session = await auth();
  const userId = session?.user?.id!;
  const today = await retrieveDateFromCookies();

  const yesterday = new Date(new Date(today).setDate(today.getDate() - 1));
  const oneDayAgo = new Date(new Date(today).setDate(today.getDate() - 2));
  const twoDaysAgo = new Date(new Date(today).setDate(today.getDate() - 3));
  const threeDaysAgo = new Date(new Date(today).setDate(today.getDate() - 4));
  const fourDaysAgo = new Date(new Date(today).setDate(today.getDate() - 5));
  const fiveDaysAgo = new Date(new Date(today).setDate(today.getDate() - 6));

  const weekStart = getWeekStartDate(today);
  const monthStart = getMonthStartDate(today);

  const [
    todayData,
    yesterdayData,
    oneDayAgoData,
    twoDaysAgoData,
    threeDaysAgoData,
    fourDaysAgoData,
    fiveDaysAgoData,
    weekData,
    monthData,
  ] = await Promise.all([
    getActivities(userId!, today),
    getActivities(userId!, yesterday),
    getActivities(userId!, oneDayAgo),
    getActivities(userId!, twoDaysAgo),
    getActivities(userId!, threeDaysAgo),
    getActivities(userId!, fourDaysAgo),
    getActivities(userId!, fiveDaysAgo),
    getActivitiesRange(userId!, today, weekStart),
    getActivitiesRange(userId!, today, monthStart),
  ]);

  if ('message' in todayData || 'message' in weekData || 'message' in monthData) return null;

  const todayChartData = prepareChartData(todayData);
  const weekChartData = prepareChartData(weekData);
  const monthChartData = prepareChartData(monthData);

  const todayTotal = getTotalTimeSpent(todayData);
  const weekTotal = getTotalTimeSpent(weekData);
  const monthTotal = getTotalTimeSpent(monthData);

  const last7days = [
    { name: 'Today', value: todayTotal },
    { name: 'Yesterday', value:  'message' in yesterdayData ? 0 : getTotalTimeSpent(yesterdayData)},
    { name: formatReadableDate(oneDayAgo), value: 'message' in oneDayAgoData ? 0 : getTotalTimeSpent(oneDayAgoData)},
    { name: formatReadableDate(twoDaysAgo), value: 'message' in twoDaysAgoData ? 0 : getTotalTimeSpent(twoDaysAgoData)},
    { name: formatReadableDate(threeDaysAgo), value: 'message' in threeDaysAgoData ? 0 : getTotalTimeSpent(threeDaysAgoData)},
    { name: formatReadableDate(fourDaysAgo), value: 'message' in fourDaysAgoData ? 0 : getTotalTimeSpent(fourDaysAgoData)},
    { name: formatReadableDate(fiveDaysAgo), value: 'message' in fiveDaysAgoData ? 0 : getTotalTimeSpent(fiveDaysAgoData)},
  ];

  const last7daysTotal = last7days.reduce((acc, { value }) => acc + value, 0);

  return (
    <div className="flex items-center flex-col gap-4 sm:flex-row sm:justify-center sm:flex-wrap [&>div]:w-full [&>div]:sm:w-[calc(50%-0.5rem)] lg:gap-8 [&>div]:lg:w-[calc(50%-1rem)] xl:h-full">
      <TimeChart
        period="last7days"
        total={last7daysTotal}
        data={last7days}
      />
      <TimeChart
        period="day"
        total={todayTotal}
        data={todayChartData}
      />
      <TimeChart
        period="week"
        total={weekTotal}
        data={weekChartData}
      />
      <TimeChart
        period="month"
        total={monthTotal}
        data={monthChartData}
      />

      <BackgroundStopwatch />
    </div>
  );
}
