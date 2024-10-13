'use client';

import { Check } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import { useRouter } from '@/ui/hooks/use-router';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export const ConfirmReorderingButton = () => {
  const { router, pathname } = useRouter();

  const [animationCompleted, setAnimationCompleted] = useState(false);

  const handleAnimationEnd = () => setAnimationCompleted(true);
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
      <Check size="20" />
    </Button>
  );
};
