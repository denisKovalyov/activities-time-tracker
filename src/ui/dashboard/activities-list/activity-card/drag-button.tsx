import { useState, PointerEvent } from 'react';
import { List } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';

export type DragButtonProps = {
  onDragStart: (e: PointerEvent<HTMLButtonElement>) => void;
};

export const DragButton = ({ onDragStart }: DragButtonProps) => {
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const handleAnimationEnd = () => setAnimationCompleted(true);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('cursor-grab', {
        'animate-fly-in opacity-0': !animationCompleted,
      })}
      style={{ touchAction: 'none' }}
      onPointerDown={onDragStart}
      onAnimationEnd={handleAnimationEnd}
    >
      <List className="h-6 w-6 text-primary dark:text-white" />
    </Button>
  );
};
