export const formatReadableDate = (
  date: Date = new Date(),
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long' },
) => {
  const dateTimeFormatter = new Intl.DateTimeFormat('en-US', options);
  return dateTimeFormatter.format(date);
}

export const getSecondsPassed = (dateStr: string | null | undefined) =>
  dateStr ? Math.floor((+new Date() - +new Date(dateStr)) / 1000) : 0;

export const formatDate = (date: Date) =>
  new Date(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`)
    .toISOString()
    .split('T')[0];

export const getWeekStartDate = (date: Date = new Date()) => {
  const currentDate = new Date(date);
  const day = currentDate.getDay();
  const distanceToMonday = (day === 0 ? -6 : 1) - day;

  currentDate.setDate(currentDate.getDate() + distanceToMonday);
  return currentDate;
}

export const getMonthStartDate = (date: Date = new Date()) => {
  const currentDate = new Date(date);
  currentDate.setDate(1);
  return currentDate;
}

export const getTimeRanges = (today: Date) => {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const weekStart = getWeekStartDate(today);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);
  lastWeekEnd.setDate(weekStart.getDate() - 1);

  const monthStart = getMonthStartDate(today);
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(monthStart.getMonth() - 1);
  const lastMonthEnd = new Date(monthStart);
  lastMonthEnd.setDate(monthStart.getDate() - 1);

  return {
    yesterday,
    weekStart,
    monthStart,
    lastWeek: [lastWeekStart, lastWeekEnd],
    lastMonth: [lastMonthStart, lastMonthEnd],
  }
}
