'use client';

import React, { ReactNode } from 'react';
import { Input, InputProps } from './input';
import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils';

export type InputButtonProps = InputProps & {
  icon: ReactNode;
  onButtonClick?: () => void;
};

const InputIcon = React.forwardRef<HTMLInputElement, InputButtonProps>(
  ({ className, icon, onButtonClick, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn('pr-9', className)}
          {...props}
          autoComplete="off"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('absolute right-0 top-0', {
            'pointer-events-none': !onButtonClick,
          })}
          onClick={onButtonClick || (() => {})}
        >
          {icon}
        </Button>
      </div>
    );
  },
);

InputIcon.displayName = 'InputButton';

export { InputIcon };
