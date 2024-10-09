import { List } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';

export type DragButtonProps = {
  onDragStart: (e: PointerEvent) => void;
}

export const DragButton = ({
  onDragStart,
}: DragButtonProps) => (
  <Button
    variant="ghost"
    size="icon"
    className="reorder-handle"
    onPointerDown={onDragStart}
    style={{ touchAction: 'none' }}
  >
    <List className="w-5 h-5 text-primary dark:text-white" />
  </Button>
);
