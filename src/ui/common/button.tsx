import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Spinner } from '@/ui/common/spinner';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 bg-opacity-10',
        accent: 'bg-accent text-white shadow hover:bg-accent/80 bg-opacity-10',
        warning: 'bg-warning text-white hover:bg-warning/80 bg-opacity-10',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background text-primary shadow-sm hover:bg-primary/50 hover:text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-primary/40 hover:text-primary-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        iconSm: 'p-1',
        iconLg: 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  loading,
  size,
  asChild = false,
  children,
  ...props
}, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), {
          'relative': loading,
        })}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <span className="invisible contents">
              {children}
            </span>
            <span className="absolute w-full h-full">
              <Spinner />
            </span>
          </>
        ) : children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
