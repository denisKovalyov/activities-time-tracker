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
  onEditClick: () => void;
  onReorderClick: () => void;
  onRemoveClick: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-full', className)}
        >
          <CaretCircleDown className="h-5 w-5 text-primary dark:text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ITEMS.map(({ label, icon: Icon }) => (
          <DropdownMenuItem
            key={label}
            onClick={handlers[`on${label}Click` as keyof typeof handlers]}
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
