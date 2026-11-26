import {
  ArrowsDownUp,
  CaretCircleDown,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils/common';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/ui/common/dropdown-menu';

export const ActivityDropdownMenu = ({
  className,
  onEdit,
  onReorder,
  onRemove,
}: {
  className: string;
  onEdit: () => void;
  onRemove: () => void;
  onReorder: () => void;
}) => {
  const menuItems = [
    { label: 'Edit', icon: PencilSimple, onClick: onEdit },
    { label: 'Reorder', icon: ArrowsDownUp, onClick: onReorder },
    { label: 'Remove', icon: Trash, onClick: onRemove },
  ];

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
        {menuItems.map(({ label, icon: Icon, onClick }) => (
          <DropdownMenuItem
            key={label}
            onClick={onClick}
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
