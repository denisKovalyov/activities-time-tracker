'use client';

import { Button } from '@/ui/common/button';
import { useRouter } from '@/ui/hooks/use-router';

export const AddActivityButton = () => {
  const {
    router,
    pathname,
    stringifyQueryParams,
  } = useRouter();

  const handleClick = () => router.push(`${pathname}?${stringifyQueryParams({ addActivity: 'true' })}`);

  return (
    <Button
      variant="accent"
      className="flex-none rounded-full text-lg relative"
      size="iconLg"
      onClick={handleClick}
    >
      +
    </Button>
  )
};
