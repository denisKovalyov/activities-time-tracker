'use client';

import { Icon } from '@/ui/common/icon';
import { cn } from '@/lib/utils';

export const ActivityIcon = ({
  name,
  color,
  className,
}: {
  name: string;
  color: string;
  className?: string;
}) => (
  <Icon
    name={name}
    className={cn('text-primary', className)}
    size="20"
    weight="duotone"
    color={color}
  />
);
