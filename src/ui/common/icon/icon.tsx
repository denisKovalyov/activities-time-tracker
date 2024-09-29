import React from 'react';
import { IconProps, Empty } from '@phosphor-icons/react';
import { icons } from './icon-list';

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = ''
}) => {
  const Icon = icons[name as keyof typeof icons];
  return Icon
    ? <Icon size={size} className={className} />
    : <Empty size={size} className={className} />
};
