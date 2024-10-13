import { useState } from 'react';
import { List } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';

export type DragButtonProps = {
  onDragStart: (e: PointerEvent) => void;
};

export const DragButton = ({ onDragStart }: DragButtonProps) => {
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const handleAnimationEnd = () => setAnimationCompleted(true);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn({
        'animate-zoom-in opacity-0': !animationCompleted,
      })}
      onPointerDown={onDragStart}
      style={{ touchAction: 'none' }}
      onAnimationEnd={handleAnimationEnd}
    >
      <List className="h-5 w-5 text-primary dark:text-white" />
    </Button>
  );
};
