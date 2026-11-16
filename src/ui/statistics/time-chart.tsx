'use client';

import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { useResizeObserver } from 'usehooks-ts';
import { PresentationChart } from '@phosphor-icons/react';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/common/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  CustomLabelRightInside,
} from '@/ui/common/chart';
import {
  type Day,
  formatReadableDay,
  getMonthStart,
  getWeekStart,
} from '@/lib/utils/day';
import { EmptyState } from '@/ui/common/empty-state';
import {
  calculateTimeValues,
  useCalculateTimeValues,
} from '@/ui/hooks/use-calculate-time-values';
import { useLiveSeconds } from '@/ui/timer/use-live-seconds';
import type { Activity, RunningTimer } from '@/lib/db/types';
import type { DataItem } from '@/ui/statistics/chart-data';

const MAX_BAR_ITEMS = 8;
const LABEL_OFFSET = 20;
const LABEL_FONT_SIZE = 14;
const CHART_MOBILE_WIDTH = 320;
const ANIMATION_DURATION = 400;

const formatTimeValue = (value?: ValueType) => {
  const timeSpent = calculateTimeValues(Number(value));
  return `${timeSpent[0]}:${timeSpent[1]}:${timeSpent[2]}`;
};

const chartConfig = {
  value: {
    label: 'Time Spent',
    // Default color
    color: 'hsl(var(--primary))',
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig;

type Period = 'day' | 'week' | 'month' | 'last7days';

const TEXT_MAP: Record<Period, { title: string; footer: string }> = {
  day: { title: 'Today', footer: 'today' },
  week: { title: 'This Week', footer: 'this week' },
  month: { title: 'This Month', footer: 'this month' },
  last7days: {
    title: 'Total Over the Last 7 Day',
    footer: 'over the last 7 days',
  },
};

type TimeChartProps = {
  data: DataItem[];
  period: Period;
  total: number;
  // Live time of `timer` after `countedAt` is added to the data
  timer: RunningTimer | null;
  countedAt: number;
  // The activity of `timer`
  runningActivity: Activity | null;
  today: Day;
};

// The running activity goes first; if there are too many bars, the smallest
// are joined into "Others"
const getBars = (data: DataItem[], activeBar: DataItem | null) => {
  const rest = data.filter(({ id }) => id !== activeBar?.id);
  const limit = MAX_BAR_ITEMS - (activeBar ? 1 : 0);
  if (rest.length <= limit) {
    return { bars: activeBar ? [activeBar, ...rest] : rest, aggregated: [] };
  }

  // One place is left for the "Others" bar
  const smallest = rest
    .toSorted((a, b) => a.value - b.value)
    .slice(0, rest.length - limit + 1);
  const others: DataItem = {
    id: 'other-id',
    name: 'Others',
    aggregate: true,
    fill: 'hsl(var(--accent))',
    value: smallest.reduce((sum, { value }) => sum + value, 0),
  };
  const kept = rest.filter((item) => !smallest.includes(item));

  return {
    bars: [...(activeBar ? [activeBar] : []), ...kept, others],
    aggregated: smallest.map(({ name }) => name),
  };
};

export function TimeChart({
  data,
  total = 0,
  period,
  timer,
  countedAt,
  runningActivity,
  today,
}: TimeChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref: ref as RefObject<HTMLDivElement>,
  });
  const liveSeconds = useLiveSeconds(timer, countedAt);
  // Animate only the first render, before live time starts changing the data
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  useEffect(() => {
    const timeoutId = setTimeout(
      () => setIsAnimationDone(true),
      ANIMATION_DURATION,
    );
    return () => clearTimeout(timeoutId);
  }, []);

  const isDaysChart = period === 'last7days';
  const activeActivity = isDaysChart ? null : runningActivity;

  const { bars, aggregated } = useMemo(
    () =>
      getBars(
        data,
        activeActivity
          ? {
              id: activeActivity.id,
              name: activeActivity.name,
              fill: `#${activeActivity.color}`,
              value:
                data.find(({ id }) => id === activeActivity.id)?.value ?? 0,
            }
          : null,
      ),
    [data, activeActivity],
  );

  // The bar that grows while the timer runs: today's or the running activity's
  const liveBarId = isDaysChart ? data[0]?.id : activeActivity?.id;
  const chartData = useMemo(
    () =>
      bars.map((bar) =>
        bar.id === liveBarId && isAnimationDone
          ? { ...bar, value: bar.value + liveSeconds }
          : bar,
      ),
    [bars, liveBarId, liveSeconds, isAnimationDone],
  );

  const isDesktop = width > CHART_MOBILE_WIDTH;
  const labelFontSize = isDesktop ? LABEL_FONT_SIZE : 12;
  const hasValues =
    chartData.some(({ value }) => value > 0) ||
    (!!liveBarId && liveSeconds > 0);
  const maxLabelLength = chartData.reduce(
    (acc, { name }) => (name.length > acc ? name.length : acc),
    0,
  );

  const timeValues = useCalculateTimeValues(total + liveSeconds);
  const title = TEXT_MAP[period].title;
  const footer = hasValues
    ? `Total time spent ${TEXT_MAP[period].footer} ${timeValues[0]}:${timeValues[1]}:${timeValues[2]}`
    : 'No data';

  const dateStyle = isDesktop ? 'long' : 'medium';
  let dateStr = formatReadableDay(today, dateStyle);
  if (period === 'week' || period === 'month') {
    const periodStart = (period === 'week' ? getWeekStart : getMonthStart)(
      today,
    );
    dateStr = `${formatReadableDay(periodStart, dateStyle)} - ${dateStr}`;
  }

  const approximateLabelWidth =
    maxLabelLength * (LABEL_FONT_SIZE * 0.5) + LABEL_OFFSET;

  const formatLabel = ({ name, aggregate }: DataItem) =>
    aggregate ? aggregated.join(', ') : name;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{dateStr}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer ref={ref} config={chartConfig}>
          {hasValues ? (
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                right: approximateLabelWidth,
              }}
            >
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis
                dataKey="value"
                type="number"
                domain={[0, 'dataMax']}
                allowDataOverflow
                hide
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent<DataItem>
                    indicator="line"
                    labelFormatter={formatLabel}
                    valueFormatter={formatTimeValue}
                  />
                }
              />
              <Bar
                dataKey="value"
                layout="vertical"
                fill="var(--color-value)"
                radius={4}
                minPointSize={2}
                isAnimationActive={!isAnimationDone}
                animationDuration={ANIMATION_DURATION}
              >
                <LabelList
                  dataKey="name"
                  position="right"
                  offset={8}
                  fontSize={labelFontSize}
                  width={approximateLabelWidth}
                  className="fill-accent"
                />
                <LabelList
                  dataKey="value"
                  offset={8}
                  content={
                    <CustomLabelRightInside
                      className="fill-[--color-label]"
                      fontSize={labelFontSize}
                      formatter={formatTimeValue}
                    />
                  }
                />
              </Bar>
            </BarChart>
          ) : (
            <EmptyState
              icon={PresentationChart}
              text="You haven't tracked any activities yet"
            />
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm font-semibold leading-none text-muted-foreground">
        {footer}
      </CardFooter>
    </Card>
  );
}
