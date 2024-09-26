'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/ui/common/button';
import { createQueryString } from '@/ui/hooks/create-query-string';

export const AddActivityButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getSearchParams = createQueryString(searchParams);

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
