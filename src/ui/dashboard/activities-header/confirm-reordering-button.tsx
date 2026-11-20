import { Check } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/ui/common/button';
import { useRouter } from '@/ui/hooks/use-router';
import { cn } from '@/lib/utils/common';

export const ConfirmReorderingButton = () => {
  const { router, pathname } = useRouter();

  const [animationCompleted, setAnimationCompleted] = useState(false);

  const handleAnimationEnd = () => setAnimationCompleted(true);
  // The order is already saved on every drop (see useActivitiesList)
  const handleClick = () => router.push(pathname);

  return (
    <Button
      variant="accent"
      className={cn('relative flex-none rounded-full', {
        'animate-fly-in opacity-0': !animationCompleted,
      })}
      size="iconLg"
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <Check weight="bold" size="20" />
    </Button>
  );
};
