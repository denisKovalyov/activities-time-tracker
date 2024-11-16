'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { formatReadableDate, getMonthStartDate, getWeekStartDate } from '@/lib/utils';
import { EmptyState } from '@/ui/common/empty-state';
import { calculateTimeValues, useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { useSharedStopwatch } from '@/ui/hooks/use-shared-stopwatch';
import { useActivities } from '@/ui/providers/activities-provider';

const MAX_BAR_ITEMS = 8;
const LABEL_OFFSET = 20;
const LABEL_FONT_SIZE = 14;
const CHART_MOBILE_WIDTH = 320;

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
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

type Period = 'day' | 'week' | 'month' | 'last7days';

const TEXT_MAP: Record<Period, { title: string; footer: string }> = {
  day: { title: 'Today', footer: 'today' },
  week: { title: 'This Week', footer: 'this week' },
  month: { title: 'This Month', footer: 'this month' },
  last7days: { title: 'Total Over the Last 7 Day', footer: 'over the last 7 days' },
};

type DataItem = {
  name: string;
  value: number;
  id?: string;
  fill?: string;
  aggregate?: boolean;
}

type TimeChartProps = {
  data: DataItem[];
  period: Period;
  total: number;
}

export function TimeChart({
  data,
  total = 0,
  period,
}: TimeChartProps) {
  const [basicData, setBasicData] = useState<DataItem[]>([]);
  const [storedActiveValue, setStoredActiveValue] = useState(0);
  const [aggregateBar, setAggregateBar] = useState<string[]>([]);

  const ref = useRef<HTMLDivElement | null>(null);
  const { width = 0 } = useResizeObserver({ ref });
  const { activeActivity } = useActivities();
  const { value: dynamicSeconds } = useSharedStopwatch();

  useEffect(() => {
    if (basicData.length || !data.length) return;

    let chartData = [...data];

    if (chartData.length > MAX_BAR_ITEMS) {
      const sortedArr = chartData
        .filter(({ id }) => id !== activeActivity?.id)
        .toSorted(({ value: valueA }, { value: valueB}) => valueA - valueB)
        // + 1 is used as we add "Other" bar
        .slice(0, chartData.length - MAX_BAR_ITEMS + 1);

      const lowestValues = new Set(sortedArr);

      chartData = [
        ...chartData.filter((activity) => !lowestValues.has(activity) && activity.id !== activeActivity?.id), {
          id: 'other-id',
          name: 'Others',
          aggregate: true,
          fill: 'hsl(var(--accent))',
          value: sortedArr.reduce((acc, { value }) => acc + value, 0),
      }];

      setAggregateBar(sortedArr.map(({ name }) => name));
    }

    if (activeActivity) {
      const isAggregate = period === 'last7days';

      const storedValue = isAggregate
        ? data[0].value
        : data.find(({ id }) => id === activeActivity.id)?.value || 0;

      setStoredActiveValue(storedValue);
      setBasicData([{
          id: activeActivity.id,
          name: isAggregate ? 'Today' : activeActivity.name,
          fill: isAggregate ? 'hsl(var(--primary)' : `#${activeActivity.color}`,
          value: storedValue,
        },
          ...chartData
            .filter(({ id, name }) => storedValue ? name !=='Today' : id !== activeActivity.id)
        ],
      );
      return;
    }

    setBasicData(chartData);
  }, [
    period,
    basicData,
    activeActivity,
    data,
    setBasicData,
    setStoredActiveValue,
    setAggregateBar,
  ]);

  const isDesktop = width > CHART_MOBILE_WIDTH;
  const labelFontSize = isDesktop ? LABEL_FONT_SIZE : 12;
  const hasValues = data.some(({ value }) => value > 0);
  const maxLabelLength = useMemo(() =>
    data.reduce((acc, { name }) => name.length > acc ? name.length : acc, 0),
  [data]);

  const timeValues = useCalculateTimeValues(total + dynamicSeconds);
  const title = TEXT_MAP[period].title;
  const footer = hasValues
    ? `Total time spent ${TEXT_MAP[period].footer} ${timeValues[0]}:${timeValues[1]}:${timeValues[2]}`
    : 'No data';

  let dateStr = formatReadableDate(new Date(), { dateStyle: isDesktop ? 'long' : 'medium' });
  if (period === 'week' || period === 'month') {
    dateStr = `${formatReadableDate((period === 'week' ? getWeekStartDate : getMonthStartDate)(), 
      { dateStyle: isDesktop ? 'long' : 'medium' })} - ` + dateStr;
  }

  const approximateLabelWidth = maxLabelLength * (LABEL_FONT_SIZE * 0.5) + LABEL_OFFSET;

  const chartData = useMemo(() => {
    if (dynamicSeconds && activeActivity) {
      const active = basicData.find(({ id }) => activeActivity.id === id)!;
      active.value = storedActiveValue + dynamicSeconds;
    }

    return basicData;
  }, [basicData, activeActivity, storedActiveValue, dynamicSeconds]);

  const formatLabel = ({ name, aggregate }: DataItem) => aggregate ? aggregateBar.join(', ') : name;

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
                allowDataOverflow
                hide
              />
              <ChartTooltip
                cursor={false}
                content={(
                  <ChartTooltipContent<DataItem>
                    indicator="line"
                    labelFormatter={formatLabel}
                    valueFormatter={formatTimeValue}
                  />
                )}
              />
              <Bar
                dataKey="value"
                layout="vertical"
                fill="var(--color-value)"
                radius={4}
                minPointSize={2}
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
                  content={(
                    <CustomLabelRightInside
                      className="fill-[--color-label]"
                      fontSize={labelFontSize}
                      formatter={formatTimeValue}
                    />
                  )}
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
      <CardFooter className="flex-col items-start gap-2 text-sm leading-none font-semibold text-muted-foreground">
        {footer}
      </CardFooter>
    </Card>
  )
}
