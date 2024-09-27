'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/ui/common/button';
import { useCreateQueryString } from '@/ui/hooks/use-create-query-string';

export const AddActivityButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getSearchParams = useCreateQueryString(searchParams);

  const handleClick = () => router.push(`${pathname}?${getSearchParams('addNew', 'true')}`);

  return (
    <Button
      className="flex-none rounded-full text-lg relative"
      size="iconLg"
      onClick={handleClick}
    >
      +
    </Button>
  )
};
