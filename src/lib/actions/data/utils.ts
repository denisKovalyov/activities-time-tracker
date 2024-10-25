export const getUpdatedFields = (data: { [key: string]: unknown }) =>
  Object.keys(data).reduce(
    (str, field, i) => `${str ? str + ', ' : ''}${field}=$${i + 1}`,
    '',
  );
