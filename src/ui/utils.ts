type SetErrorFn<T> = (
  field: keyof T,
  { message, type }: { message: string; type: 'custom' },
) => void;

export const matchFieldErrors = <T>(
  errors: Partial<{ [key in keyof T]: string[] }>,
  setError: SetErrorFn<T>,
) =>
  (Object.entries(errors) as Array<[keyof T, string[]]>).forEach(
    ([field, [message]]) => {
      setError(field, { message, type: 'custom' });
    },
  );
