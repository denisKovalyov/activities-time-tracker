import React, { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { CaretUpDown } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/ui/common/command';
import { Drawer, DrawerContent, DrawerTrigger } from '@/ui/common/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/common/popover';
import { Icon, icons as iconsMap } from '@/ui/common/icon';
import { cn } from '@/lib/utils/common';

const icons: string[] = Object.keys(iconsMap);

export function IconPicker({
  selected,
  onSelect,
  className,
}: {
  selected: string;
  onSelect: (icon: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const TriggerButton = (
    <Button
      variant="outline"
      className={cn('w-full justify-start px-3', className)}
    >
      {selected ? (
        <>
          <span className="mr-2">Selected icon:</span>
          <Icon name={selected} size="18" />
        </>
      ) : (
        <span>Select icon</span>
      )}
      <CaretUpDown weight="fill" className="ml-auto" />
    </Button>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
        <PopoverContent className="w-[256px] p-0" align="start" side="top">
          <IconGrid
            setOpen={setOpen}
            onSelect={onSelect}
            selectedIcon={selected}
            iconSize="20"
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <IconGrid
            setOpen={setOpen}
            onSelect={onSelect}
            selectedIcon={selected}
            iconSize="26"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function IconGrid({
  setOpen,
  onSelect,
  selectedIcon,
  iconSize,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (icon: string) => void;
  selectedIcon: string;
  iconSize: string;
}) {
  return (
    <Command>
      <CommandInput autoFocus placeholder="Search icon..." />
      <CommandList>
        <CommandEmpty>No icons found.</CommandEmpty>
        <CommandGroup className="[&>div]:flex [&>div]:flex-wrap [&>div]:gap-2 [&>div]:sm:gap-4">
          {icons.map((name) => (
            <IconGridItem
              key={name}
              name={name}
              selected={selectedIcon === name}
              size={iconSize}
              onSelect={onSelect}
              setOpen={setOpen}
            />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const IconGridItem = React.memo(function IconGridItem({
  name,
  size,
  selected,
  onSelect,
  setOpen,
}: {
  name: string;
  size: string;
  selected: boolean;
  onSelect: (icon: string) => void;
  setOpen: (open: boolean) => void;
}) {
  const handleSelect = () => {
    onSelect(name);
    setOpen(false);
  };

  return (
    <CommandItem
      value={name}
      onSelect={handleSelect}
      className={cn('cursor-pointer p-2', {
        'bg-grayColored': selected,
      })}
    >
      <Icon name={name} size={size} />
    </CommandItem>
  );
});
