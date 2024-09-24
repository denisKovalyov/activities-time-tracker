'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Icon } from '@phosphor-icons/react';
import { MENU_ITEMS } from '@/ui/dashboard/layout/constants';
import { TooltipProvider , Tooltip, TooltipContent, TooltipTrigger } from '@/ui/common/tooltip';
import { cn } from '@/lib/utils';

const MenuItem = ({
  text,
  path,
  active,
  icon: IconComponent,
}: {
  text: string;
  path: string;
  active: boolean;
  icon: Icon;
}) => {
  const [animationCompleted, setAnimationCompleted] = useState(false);

  const handleAnimationEnd = () =>  setAnimationCompleted(true);

  useEffect(() => {
    setAnimationCompleted(false);
  }, [active]);

  const Item = (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <IconComponent size="24" />
          <span className="sr-only">{text}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={20}>{text}</TooltipContent>
    </Tooltip>
  );

  const className = cn('flex items-end mx-4 p-4 rounded-full text-muted-foreground',
    active
      ? 'bg-secondary text-white relative outline outline-8 outline-background animate-bounce-finished relative'
      : 'hover:text-foreground',
  );

  return (
    active
      ? (
        <div
          className={className}
          onAnimationEndCapture={handleAnimationEnd}
        >
          {animationCompleted && (
            <span className="absolute -z-10 top-[-9.5px] left-[-9px] w-[calc(100%+18px)] h-full rounded-t-full bg-secondary dark:bg-primary" />
          )}
          {Item}
        </div>
      ) : (
        <Link
          href={`/dashboard/${path}`}
          className={className}
          onClick={handleAnimationEnd}
        >
          {Item}
        </Link>
      )
  );
}

export const MobileNavigation = () => {
  const pathname = usePathname().slice('/dashboard/'.length);

  return (
    <nav className="w-full h-full flex justify-center items-center relative">
      <TooltipProvider delayDuration={300}>
        {MENU_ITEMS
          .toSorted((a, b) => a.order - b.order)
          .map(({ path, ...props }) => (
            <MenuItem key={path} active={pathname === path} path={path} {...props} />
          ))
        }
      </TooltipProvider>
    </nav>
  );
}
