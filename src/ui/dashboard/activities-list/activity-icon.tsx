'use client';

import { Icon } from '@/ui/common/icon';

export const ActivityIcon = ({
  name,
  color,
}: {
  name: string;
  color: string;
}) => (
  <Icon
    name={name}
    className="text-primary"
    size="20"
    weight="duotone"
    color={color}
  />
);
