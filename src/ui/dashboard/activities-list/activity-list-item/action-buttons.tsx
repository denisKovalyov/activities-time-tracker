import { CSSProperties, Ref } from 'react';
import { ArrowsDownUp, NotePencil, X } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils/common';

const BUTTON_WIDTH = 55;
export const BUTTONS_WIDTH = BUTTON_WIDTH * 3;
const buttonClassNames =
  'absolute h-full px-3 rounded-none shadow-none border-y border-r dark:border-gray-200';

type ActionButtonProps = {
  onClick: () => void;
  applyTransition: boolean;
  style: CSSProperties;
};

const ReorderButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    className={`${buttonClassNames} border-secondary`}
    variant="secondary"
    onClick={onClick}
  >
    <ArrowsDownUp size="30" />
  </Button>
);

const EditButton = ({ applyTransition, onClick, style }: ActionButtonProps) => (
  <Button
    className={cn(
      `${buttonClassNames} border-secondary transition-transform duration-0 will-change-transform`,
      {
        'duration-300': applyTransition,
      },
    )}
    variant="warning"
    onClick={onClick}
    style={style}
  >
    <NotePencil size="30" />
  </Button>
);

const DeleteButton = ({
  applyTransition,
  onClick,
  style,
}: ActionButtonProps) => (
  <Button
    className={cn(
      `${buttonClassNames} rounded-r-md border-destructive will-change-transform`,
      {
        'transition-transform duration-300': applyTransition,
      },
    )}
    variant="destructive"
    onClick={onClick}
    style={style}
  >
    <X size="30" />
  </Button>
);

export const ActionButtons = ({
  visibleWidth,
  applyTransition,
  onReorder,
  onEdit,
  onRemove,
  ref,
}: {
  visibleWidth: number;
  applyTransition: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onReorder: () => void;
  ref?: Ref<HTMLDivElement>;
}) => {
  const shift = (visibleWidth / BUTTONS_WIDTH) * 100;
  return (
    <div ref={ref} className="absolute bottom-0 right-0 top-0">
      <ReorderButton onClick={onReorder} />
      <EditButton
        onClick={onEdit}
        applyTransition={applyTransition}
        style={{ transform: `translateX(${shift}%)` }}
      />
      <DeleteButton
        onClick={onRemove}
        applyTransition={applyTransition}
        style={{ transform: `translateX(${shift * 2}%)` }}
      />
    </div>
  );
};
