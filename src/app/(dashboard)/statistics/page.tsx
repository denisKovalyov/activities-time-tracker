import { auth } from '@/auth';

import { TimeChart } from '@/ui/statistics/time-chart';
import { BackgroundStopwatch } from '@/ui/statistics/background-stopwatch';
import { getActivities, getActivitiesRange } from '@/lib/actions/activity';
import { retrieveDateFromCookies } from '@/app/(dashboard)/next-api-helpers';
import { getTotalTimeSpent, getWeekStartDate, getMonthStartDate, prepareChartData } from '@/lib/utils';

export default async function Statistics() {
  const session = await auth();
  const userId = session?.user?.id!;
  const today = await retrieveDateFromCookies();

  const weekStart = getWeekStartDate(today);
  const monthStart = getMonthStartDate(today);

  const [
    todayData,
    weekData,
    monthData,
  ] = await Promise.all([
    getActivities(userId!, today),
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

  return (
    <div className="flex items-center flex-col gap-4 sm:flex-row sm:justify-center sm:flex-wrap [&>div]:w-full [&>div]:sm:w-[calc(50%-0.5rem)] [&>div]:xl:w-[calc(33%-0.5rem)] xl:h-full">
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
