import { useCallback } from 'react';

export const useCreateQueryString = (searchParams: URLSearchParams) => useCallback(
  (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)

    return params.toString()
  },
  [searchParams]
);
