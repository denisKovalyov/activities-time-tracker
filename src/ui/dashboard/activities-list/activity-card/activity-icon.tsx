import { Icon, IconProps } from '@/ui/common/icon';
import { cn } from '@/lib/utils';

export const ActivityIcon = ({
  name,
  color,
  weight = 'fill',
  className,
}: {
  name: string;
  color: string;
  weight?: IconProps['weight'];
  className?: string;
}) => (
  <Icon
    name={name}
    className={cn('text-primary', className)}
    size="20"
    weight={weight}
    color={color}
  />
);
