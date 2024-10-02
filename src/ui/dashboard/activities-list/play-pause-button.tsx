'use client';

import { PlayPause } from '@phosphor-icons/react';
import { Button } from '@/ui/common/button';

export const PlayPauseButton = () => {
  return (
    <Button variant="outline" size="icon" className="rounded-full">
      <PlayPause />
    </Button>
  );
}
