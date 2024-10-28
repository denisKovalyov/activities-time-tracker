import type { Icon } from '@phosphor-icons/react';

export const EmptyState = ({
  icon: Icon,
  text,
}: {
  icon: Icon;
  text: string;
}) => (
  <div className="flex w-full h-full">
    <div className="m-auto flex flex-col items-center">
      <Icon
        className="h-auto w-28 text-primary"
        weight="duotone"
      />
      <h2 className="font-normal text-primary">
        {text}
      </h2>
    </div>
  </div>
);
