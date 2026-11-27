import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The current query with the given parameters set
  const stringifyQueryParams = (parameters: { [name: string]: string }) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(parameters).forEach(([name, value]) =>
      params.set(name, value),
    );
    return params.toString();
  };

  return { router, pathname, searchParams, stringifyQueryParams };
};
