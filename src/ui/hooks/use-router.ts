import { useRouter as useRouterNext, usePathname, useSearchParams } from 'next/navigation';
import { useCreateQueryString } from '@/ui/hooks/use-create-query-string';

export const useRouter = () => {
  const router = useRouterNext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stringifyQueryParams = useCreateQueryString(searchParams);

  return {
    router,
    pathname,
    searchParams,
    stringifyQueryParams,
  };
}
