'use client';

import { ForwardRefExoticComponent, RefAttributes, useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '@raddix/use-media-query';
import { icons as iconsMap } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { CaretUpDown } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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

type Icon = {
  value: string;
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

const icons: Icon[] = Object.entries(iconsMap).map(([value, icon]) => ({
  value,
  label: value,
  icon,
}));

export function IconPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedStatus, setSelectedStatus] = useState<Icon | null>(null);

  useEffect(() => {
    if (selected) {
      setSelectedStatus(icons.find(({ value }) => value === selected)!)
    }
  }, [selected]);

  const handleIconSelect = (value: string) => {
    setSelectedStatus(
      icons.find((icon) => icon.value === value) || null
    );
    onSelect(value);
  };

  const Icon = selectedStatus?.icon;

  const TriggerButton = (
    <Button variant="outline" className="w-full justify-start px-3">
      {Icon ? (
        <>
          <span className="mr-2">Selected icon:</span>
          <Icon size="18" />
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
          <StatusList setOpen={setOpen} onSelect={handleIconSelect} />
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
          <StatusList setOpen={setOpen} onSelect={handleIconSelect} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function StatusList({
  setOpen,
  onSelect,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (status: string) => void;
}) {
  const parentRef = useRef(null);

  return (
    <Command>
      <CommandInput placeholder="Search icon..." />
      <CommandList>
        <CommandEmpty>No icons found.</CommandEmpty>
        <CommandGroup>
          <div ref={parentRef} className="flex flex-wrap gap-2 overflow-auto" >
            {icons.map(({ icon: Icon, value }) => (
              <CommandItem
                key={value}
                value={value}
                className="cursor-pointer"
                onSelect={(value) => {
                  onSelect(value);
                  setOpen(false);
                }}
              >
                <Icon size="18"/>
              </CommandItem>
            ))}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
