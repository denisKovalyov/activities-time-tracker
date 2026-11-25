import { IconProps, Empty } from '@phosphor-icons/react';
import { icons } from './icon-list';

export function Icon({ name, size = 24, ...props }: IconProps) {
  const PhosphorIcon = icons[name as keyof typeof icons] || Empty;

  return <PhosphorIcon size={size} {...props} />;
}

export type { IconProps };
