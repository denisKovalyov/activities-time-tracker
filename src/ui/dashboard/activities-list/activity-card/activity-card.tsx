import { ReactNode } from 'react';

import { Card } from '@/ui/common/card';
import { PlayPauseButton } from '@/ui/dashboard/activities-list/activity-card/play-pause-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-card/activity-icon';
import { ActivityDropdownMenu } from '@/ui/dashboard/activities-list/activity-card/activity-dropdown-menu';
import { cn } from '@/lib/utils';
import { ActivityExtended } from '@/lib/definitions';

export const ActivityCard = ({
  children,
  className,
  activity,
  onReorder,
  onEdit,
  onRemove,
}: {
  children: ReactNode;
  activity: ActivityExtended;
  onEdit: () => void;
  onRemove: () => void;
  onReorder?: () => void;
  className?: string;
}) => {
  const { name, color, icon } = activity;

  return (
    <Card
      className={cn('flex w-full flex-none items-center justify-between p-4', className)}
    >
      <div className="flex max-w-[70%] flex-none items-center overflow-hidden">
        <PlayPauseButton className="flex-none" />
        <span className="mx-2 truncate font-semibold text-accent-foreground">
          {name}
        </span>
        <ActivityIcon
          className="flex-none"
          name={icon}
          color={`#${color}`}
        />
      </div>

      <div className="flex flex-none items-center">
        {children}

        <ActivityDropdownMenu
          className="ml-2 hidden sm:inline-flex"
          onReorder={onReorder}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </div>
    </Card>
  );
}
