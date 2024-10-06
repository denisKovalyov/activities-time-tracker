'use client';

import {
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

export const ActivityDropdownMenu = ({
  className,
  onEditClick,
  onRemoveClick,
}: {
  onEditClick: () => void;
  onRemoveClick: () => void;
  className: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('rounded-full', className)}
        >
          <CaretCircleDown
            weight="fill"
            className="w-5 h-5 text-primary dark:text-white"
          />
        </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={onEditClick}
          className="flex items-center cursor-pointer"
        >
          <span className="mr-1">Edit</span>
          <PencilSimple size="15" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRemoveClick}
          className="cursor-pointer"
        >
          <span className="mr-1">Remove</span>
          <Trash size="15" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}