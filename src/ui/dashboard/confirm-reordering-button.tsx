'use client';

import { Check } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/ui/common/button';
import { useRouter } from '@/ui/hooks/use-router';
import { refetchActivities } from '@/lib/actions/activity/app';
import { cn } from '@/lib/utils';

export const ConfirmReorderingButton = () => {
  const { router, pathname } = useRouter();

  const [animationCompleted, setAnimationCompleted] = useState(false);

  const handleAnimationEnd = () => setAnimationCompleted(true);
  const handleClick = async () => {
    await refetchActivities();
    router.push(pathname);
  };

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
      <Check size="20" />
    </Button>
  );
};
