import { Plus } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import { useNavigation } from '@/ui/hooks/use-navigation';

export const AddActivityButton = () => {
  const { router, pathname, stringifyQueryParams } = useNavigation();

  const handleClick = () =>
    router.push(`${pathname}?${stringifyQueryParams({ addActivity: 'true' })}`);

  return (
    <Button
      variant="accent"
      className="relative flex-none rounded-full text-lg"
      size="iconLg"
      onClick={handleClick}
    >
      <Plus weight="bold" size="20" />
    </Button>
  );
};
