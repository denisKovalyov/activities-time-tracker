'use client';

import {Button} from '@/ui/common/button';
import {ShieldChevron} from '@phosphor-icons/react';

export const ActivityMenu = () => {

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
    >
      <ShieldChevron
        size="9"
        className="overflow-hidden rounded-full text-primary dark:text-white"
      />
    </Button>
  );
}