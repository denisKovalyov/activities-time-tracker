import { Pause } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';

export const StopRecordButton = ({
  onClick,
}: {
  onClick: () => void;
}) => (
  <Button
    variant="accent"
    className="relative flex-none rounded-full text-lg"
    size="iconLg"
    onClick={onClick}
  >
    <Pause weight="fill" size="20" />
  </Button>
);
