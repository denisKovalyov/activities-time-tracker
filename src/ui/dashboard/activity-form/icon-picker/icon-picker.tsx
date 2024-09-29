'use client';

import React, { useState } from 'react';
import { useMediaQuery } from '@raddix/use-media-query';
import { icons as iconsMap } from 'lucide-react';
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
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/ui/common/drawer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/common/popover';
import { IconLucide } from '@/ui/common/icon-lucide';
import { cn } from '@/lib/utils';

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

  const handleIconSelect = (value: string) => {
    onSelect(value);
  };

  const TriggerButton = (
    <Button variant="outline" className={cn('w-full justify-start px-3', className)}>
      {selected ? (
        <>
          <span className="mr-2">Selected icon:</span>
          <IconLucide name={selected} size="18" />
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
        <PopoverTrigger asChild>
          {TriggerButton}
        </PopoverTrigger>
        <PopoverContent className="w-[256px] p-0" align="start" side="top">
          <IconGrid setOpen={setOpen} onSelect={handleIconSelect} selectedIcon={selected} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {TriggerButton}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <IconGrid setOpen={setOpen} onSelect={handleIconSelect} selectedIcon={selected} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function IconGrid({
  setOpen,
  onSelect,
  selectedIcon,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (status: string) => void;
  selectedIcon: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Command>
      <CommandInput
        // value={searchTerm}
        // onValueChange={(value) => {
        //   console.log('value', value);
        //   setSearchTerm(value);
        // }}
        placeholder="Search icon..."
      />
      <CommandList>
        <CommandEmpty>No icons found.</CommandEmpty>
        <CommandGroup
          className="[&>div]:flex [&>div]:flex-wrap [&>div]:gap-4"
          onClick={(event) => {
            onSelect((event.target as HTMLElement).dataset.icon || '');
            setOpen(false);
          }}
        >
          {icons.map((name) => (
            <IconItem key={name} name={name} selected={selectedIcon === name} size="20" />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const IconItem = React.memo(({
  name,
  size,
  selected,
}: {
  name: string;
  size: string;
  selected: boolean;
}) => (
  <CommandItem
    value={name}
    data-icon={name}
    className={cn('cursor-pointer p-2 relative  after:absolute after:left-0 after:w-full after:h-full after:z-10', {
      'bg-accent border border-primary': selected,
    })}
  >
    <IconLucide name={name} size={size} />
  </CommandItem>
));
