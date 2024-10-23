'use client';

import { PlayPause, Pause } from '@phosphor-icons/react';
import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';

export const PlayPauseButton = ({
  onClick,
  isRunning,
  className,
}: {
  onClick: () => void;
  isRunning: boolean;
  className?: string
}) => {
  const Icon = isRunning ? Pause : PlayPause;

  return (
    <Button
      variant="accent"
      size="icon"
      className={cn('rounded-full', className)}
      onClick={onClick}
    >
      <Icon weight="fill" />
    </Button>
  );
};
