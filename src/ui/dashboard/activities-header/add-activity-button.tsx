'use client';

import { Plus } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import { useRouter } from '@/ui/hooks/use-router';

export const AddActivityButton = () => {
  const { router, pathname, stringifyQueryParams } = useRouter();

  const handleClick = () =>
    router.push(`${pathname}?${stringifyQueryParams({ addActivity: 'true' })}`);

  return (
    <Button
      variant="accent"
      className="relative flex-none rounded-full text-lg"
      size="iconLg"
      onClick={handleClick}
    >
      <Plus size="20" />
    </Button>
  );
};
