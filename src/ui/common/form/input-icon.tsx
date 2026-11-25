'use client';

import React, { ReactNode } from 'react';
import { Input, InputProps } from './input';
import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils/common';

export type InputIconProps = InputProps & {
  icon: ReactNode;
  onButtonClick?: () => void;
};

const InputIcon = ({
  className,
  icon,
  onButtonClick,
  ...props
}: InputIconProps) => {
  return (
    <div className="relative">
      <Input className={cn('pr-9', className)} {...props} autoComplete="off" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('absolute right-0 top-0', {
          'pointer-events-none': !onButtonClick,
        })}
        onClick={onButtonClick}
      >
        {icon}
      </Button>
    </div>
  );
};

export { InputIcon };
