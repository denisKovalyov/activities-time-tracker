import React from 'react';
import { IconProps, Empty } from '@phosphor-icons/react';
import { icons } from './icon-list';

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  weight,
  color,
}) => {
  const Icon = icons[name as keyof typeof icons] || Empty;

  return (
    <Icon size={size} weight={weight} className={className} color={color} />
  );
};

export type { IconProps };
