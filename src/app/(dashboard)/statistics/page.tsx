import { auth } from '@/auth';

import { TimeChart } from '@/ui/statistics/time-chart';
import { getActivities, getActivitiesRange } from '@/lib/actions/activity';
import { getRecord } from '@/lib/actions/record';
import { retrieveDateFromCookies } from '@/app/(dashboard)/next-api-helpers';
import { calculateTimeDiff, getSecondsPassed, getTimeRanges, prepareChartData } from '@/lib/utils';

export default async function Statistics() {
  const session = await auth();
  const userId = session?.user?.id!;
  const today = await retrieveDateFromCookies();

  const {
    yesterday,
    weekStart,
    monthStart,
    lastWeek: [lastWeekStart, lastWeekEnd],
    lastMonth: [lastMonthStart, lastMonthEnd]
  } = getTimeRanges(today);

  const [
    todayData,
    yesterdayData,
    weekData,
    lastWeekData,
    monthData,
    lastMonthData,
    record,
  ] = await Promise.all([
    getActivities(userId!, today),
    getActivities(userId!, yesterday),
    getActivitiesRange(userId!, today, weekStart),
    getActivitiesRange(userId!, lastWeekStart, lastWeekEnd),
    getActivitiesRange(userId!, today, monthStart),
    getActivitiesRange(userId!, lastMonthStart, lastMonthEnd),
    getRecord(userId!, today),
  ]);

  if ('message' in todayData || 'message' in weekData || 'message' in monthData) return null;

  const activeActivity =  record && 'current_activity' in record ? record.current_activity : null;
  const currentTimeSpent = getSecondsPassed(activeActivity?.[1]);

  const todayChartData = prepareChartData(todayData, currentTimeSpent, activeActivity);
  const weekChartData = prepareChartData(weekData, currentTimeSpent, activeActivity);
  const monthChartData = prepareChartData(monthData, currentTimeSpent, activeActivity);

  const todayDiff = calculateTimeDiff(todayData, 'message' in yesterdayData ? [] : yesterdayData);
  const weekDiff = calculateTimeDiff(weekData, 'message' in lastWeekData ? [] : lastWeekData);
  const monthDiff = calculateTimeDiff(monthData, 'message' in lastMonthData ? [] : lastMonthData);

  return (
    <div className="flex items-center flex-col gap-4 sm:flex-row sm:justify-center sm:flex-wrap [&>div]:w-full [&>div]:sm:w-[calc(50%-0.5rem)] [&>div]:xl:w-[calc(33%-0.5rem)] xl:h-full">
      <TimeChart
        period="day"
        delta={todayDiff}
        data={todayChartData}
      />
      <TimeChart
        period="week"
        delta={weekDiff}
        data={weekChartData}
      />
      <TimeChart
        period="month"
        delta={monthDiff}
        data={monthChartData}
      />
    </div>
  );
}
