export const getUpdatedFields = (data: { [key: string]: unknown }) =>
  Object.keys(data).reduce(
    (str, field, i) => `${str ? str + ', ' : ''}${field}=$${i + 1}`,
    '',
  );

export const formatDate = (date: Date) => date.toISOString().split('T')[0];
