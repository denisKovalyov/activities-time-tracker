'use client';

import { PlayPause } from '@phosphor-icons/react';
import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';

export const PlayPauseButton = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <Button variant="outline" size="icon" className={cn('rounded-full', className)}>
      <PlayPause />
    </Button>
  );
}
