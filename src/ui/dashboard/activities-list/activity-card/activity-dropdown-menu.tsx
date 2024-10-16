'use client';

import {
  ArrowsDownUp,
  CaretCircleDown,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/ui/common/dropdown-menu';
import { ActionHandlers } from '@/ui/dashboard/activities-list/types';

const ITEMS = [
  { label: 'Edit', icon: PencilSimple },
  { label: 'Reorder', icon: ArrowsDownUp },
  { label: 'Remove', icon: Trash },
];

export const ActivityDropdownMenu = ({
  className,
  ...handlers
}: {
  className: string;
  onEdit: () => void;
  onRemove: () => void;
  onReorder?: () => void;
}) => {
  const menuItems = handlers.onReorder ? ITEMS : ITEMS.filter(({ label }) => label !== 'Reorder');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-full', className)}
        >
          <CaretCircleDown className="h-6 w-6 text-primary dark:text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menuItems.map(({ label, icon: Icon }) => (
          <DropdownMenuItem
            key={label}
            onClick={handlers[`on${label}` as keyof typeof handlers]}
            className="flex cursor-pointer items-center"
          >
            <span className="mr-1">{label}</span>
            <Icon size="15" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
