import { forwardRef } from 'react';
import { ArrowsDownUp, NotePencil, X } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';

const BUTTON_WIDTH = 55;
export const BUTTONS_WIDTH = BUTTON_WIDTH * 3;
const buttonClassNames =
  'absolute h-full px-3 rounded-none shadow-none border-y border-r dark:border-gray-200';

export const ActionButtons = forwardRef<
  HTMLDivElement,
  {
    visibleWidth: number;
    applyTransition: boolean;
    onReorderClick: () => void;
    onEditClick: () => void;
    onRemoveClick: () => void;
  }
>(
  (
    {
      visibleWidth,
      applyTransition,
      onReorderClick,
      onEditClick,
      onRemoveClick,
    },
    ref,
  ) => {
    const shift = (visibleWidth / BUTTONS_WIDTH) * 100;
    return (
      <div ref={ref} className="rounded-r-m absolute bottom-0 right-0 top-0">
        <Button
          className={cn(
            `${buttonClassNames} border-warning transition-transform duration-0`,
            {
              'duration-300': applyTransition,
            },
          )}
          variant="warning"
          onClick={onEditClick}
        >
          <NotePencil size="30" />
        </Button>
        <Button
          className={cn(
            `${buttonClassNames} border-secondary transition-transform duration-0 will-change-transform`,
            {
              'duration-300': applyTransition,
            },
          )}
          style={{ transform: `translateX(${shift}%)` }}
          variant="secondary"
          onClick={onReorderClick}
        >
          <ArrowsDownUp size="30" />
        </Button>
        <Button
          className={cn(
            `${buttonClassNames} rounded-r-md border-destructive will-change-transform`,
            {
              'transition-transform duration-300': applyTransition,
            },
          )}
          style={{ transform: `translateX(${shift * 2}%)` }}
          variant="destructive"
          onClick={onRemoveClick}
        >
          <X size="30" />
        </Button>
      </div>
    );
  },
);

ActionButtons.displayName = 'ActionButtons';
