export const getUpdatedFields = (data: { [key: string]: unknown }) =>
  Object.keys(data).reduce(
    (str, field, i) => `${str ? str + ', ' : ''}${field}=$${i + 1}`,
    '',
  );

export const formatDate = (date: Date, withTime = false) => {
  const dateStr = date.toISOString();
  return withTime ? dateStr : dateStr.split('T')[0];
};

export const getSecondsPassed = (dateStr: string | null | undefined) =>
  dateStr ? Math.floor((+new Date() - +new Date(dateStr)) / 1000) : 0;
