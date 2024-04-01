'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input, type InputProps } from './input';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/common/button';

const InputPassword = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    const togglePasswordVisibility = () => setIsVisible((state) => !state);
    const Icon = isVisible ? EyeSlash : Eye;

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn('pr-9', className)}
          {...props}
          type={isVisible ? 'text' : 'password'}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0"
          onClick={togglePasswordVisibility}
        >
          <Icon weight="duotone" className="w-4 h-4 text-primary" />
        </Button>
      </div>
  );
});

export { InputPassword };
