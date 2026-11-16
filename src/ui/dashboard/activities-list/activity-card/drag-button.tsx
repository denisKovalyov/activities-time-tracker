import { useState, PointerEvent } from 'react';
import { List } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';

export type DragButtonProps = {
  onDragStart: (e: PointerEvent<HTMLButtonElement>) => void;
  disabled: boolean;
};

export const DragButton = ({ onDragStart, disabled }: DragButtonProps) => {
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
      disabled={disabled}
      onPointerDown={onDragStart}
      onAnimationEnd={handleAnimationEnd}
    >
      <List className="h-6 w-6 text-primary dark:text-white" />
    </Button>
  );
};
