import { useCallback } from 'react';

export const useCreateQueryString = (searchParams: URLSearchParams) =>
  useCallback(
    (parameters: { [name: string]: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(parameters).forEach(([name, value]) => {
        params.set(name, value);
      });

      return params.toString();
    },
    [searchParams],
  );
