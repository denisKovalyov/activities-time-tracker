export const formatReadableDate = (
  date: Date = new Date(),
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) => {
  const dateTimeFormatter = new Intl.DateTimeFormat('en-US', options);
  return dateTimeFormatter.format(date);
};
