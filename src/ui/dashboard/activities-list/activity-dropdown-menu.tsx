'use client';

import { CaretCircleDown } from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';

export const ActivityDropdownMenu = ({
  className,
}: {
  className?: string;
}) => {

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('rounded-full', className)}
    >
      <CaretCircleDown
        className="w-5 h-5 text-primary dark:text-white"
      />
    </Button>
  );
}