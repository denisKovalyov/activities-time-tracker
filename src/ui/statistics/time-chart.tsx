'use client';

import { JSX, useMemo, useRef } from 'react';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { useResizeObserver } from 'usehooks-ts';
import { TrendUp, TrendDown, PresentationChart } from '@phosphor-icons/react';
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
import { calculateTimeValues } from '@/ui/hooks/use-calculate-time-values';

const LABEL_OFFSET = 20;
const LABEL_FONT_SIZE = 14;
const CHART_MOBILE_WIDTH = 320;

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

const TITLE_MAP = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
}

type DataItem = {
  name: string;
  fill: string;
  value: number;
}

type TimeChartProps = {
  data: DataItem[];
  period: 'day' | 'week' | 'month';
  delta: number;
}

export function TimeChart({
  data,
  delta = 0,
  period,
}: TimeChartProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { width = 0 } = useResizeObserver({ ref });

  const isDesktop = width > CHART_MOBILE_WIDTH;

  const labelFontSize = isDesktop ? LABEL_FONT_SIZE : 12;
  const hasValues = data.some(({ value }) => value > 0);
  const maxLabelLength = useMemo(() =>
    data.reduce((acc, { name }) => name.length > acc ? name.length : acc, 0),
  [data]);

  const periodText = period === 'day' ? 'yesterday' : `last ${period}`;
  let footer: JSX.Element | string = hasValues
    ? `Total time unchanged from ${periodText}`
    : 'No data';
  if (delta < 0) footer = <>{`Total time down ${Math.abs(delta).toFixed()}% compared to ${periodText} `} <TrendDown className="h-4 w-4" /></>;
  if (delta > 0) footer = <>{`Total time up ${delta.toFixed()}% over ${periodText} `} <TrendUp className="h-4 w-4" /></>;

  let dateStr = formatReadableDate(new Date(), { dateStyle: isDesktop ? 'long' : 'medium' });
  if (period === 'week') {
    dateStr = `${formatReadableDate(getWeekStartDate(), { dateStyle: isDesktop ? 'long' : 'medium' })} - ` + dateStr;
  }
  if (period === 'month') {
    dateStr = `${formatReadableDate(getMonthStartDate(), { dateStyle: isDesktop ? 'long' : 'medium' })} - ` + dateStr;
  }

  const formatTimeValue = (value?: ValueType) => {
    const timeSpent = calculateTimeValues(Number(value));
    return `${timeSpent[0]}:${timeSpent[1]}:${timeSpent[2]}`;
  };

  const approximateLabelWidth = maxLabelLength * (LABEL_FONT_SIZE * 0.5) + LABEL_OFFSET;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{TITLE_MAP[period]}</CardTitle>
        <CardDescription>{dateStr}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer ref={ref} config={chartConfig}>
          {hasValues ? (
            <BarChart
              accessibilityLayer
              data={data}
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
                  <ChartTooltipContent
                    indicator="line"
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
            </BarChart>) : (
            <EmptyState
              icon={PresentationChart}
              text="You haven't tracked any activities yet"
            />
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          {footer}
        </div>
      </CardFooter>
    </Card>
  )
}
