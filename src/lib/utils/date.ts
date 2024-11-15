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
  `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;

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
