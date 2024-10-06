import { NotePencil, X } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';

const buttonClassNames = 'h-auto px-3 rounded-none shadow-none dark:border-y dark:border-r';

export const ActionButtons = ({
  onEditClick,
  onRemoveClick,
}: {
  onEditClick: () => void;
  onRemoveClick: () => void;
}) => (
  <>
    <Button
      className={`${buttonClassNames} border-warning`}
      variant="warning"
      onClick={onEditClick}
    >
      <NotePencil size="30" />
    </Button>
    <Button
      className={`${buttonClassNames} border-destructive rounded-r-md`}
      variant="destructive"
      onClick={onRemoveClick}
    >
      <X size="30" />
    </Button>
  </>
);
