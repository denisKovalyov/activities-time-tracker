import { useState } from 'react';

type ReturnType =
  | { success: true }
  | { errors: {[key: string]: string[]} }
  | { message: string }
  | undefined;

export const useAction = <Args extends unknown[], Result = ReturnType>(
  action: (...args: Args) => Promise<Result>,
  defaultState = false,
) => {
  const [isLoading, setIsLoading] = useState(defaultState);

  const decorator = async (...params: Args): Promise<Result> => {
    setIsLoading(true);
    const result = await action(...params);
    setIsLoading(false);
    return result;
  }

  return {
    action: decorator,
    isLoading,
  }
}
