'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils/common';

const Separator = ({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) => (
  <SeparatorPrimitive.Root
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className,
    )}
    {...props}
  />
);

const TextSeparator = ({
  className,
  text,
}: {
  text: string;
  className?: string;
}) => (
  <div className={cn('flex items-center', className)}>
    <Separator className="my-4 shrink bg-primary" />
    <p className="mx-2 shrink-0 uppercase text-primary">{text}</p>
    <Separator className="my-4 shrink bg-primary" />
  </div>
);

export { Separator, TextSeparator };
