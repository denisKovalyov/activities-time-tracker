'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOut } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';

import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/ui/common/tooltip';
import { SignOutButton } from '@/ui/dashboard/layout/sign-out-button';
import { Logo } from '@/ui/common/logo';
import { MENU_ITEMS } from '@/ui/dashboard/layout/constants';
import { cn } from '@/lib/utils';

const itemClassNames =
  'flex h-9 w-9 items-center justify-center text-accent-foreground transition-colors hover:text-accent-foreground/80';

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
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        href={`/dashboard/${path}`}
        className={cn(itemClassNames, {
          'text-accent hover:text-accent': active,
        })}
      >
        <IconComponent size="26" />
        <span className="sr-only">{text}</span>
      </Link>
    </TooltipTrigger>
    <TooltipContent side="right" className="bg-accent/90">
      {text}
    </TooltipContent>
  </Tooltip>
);

export function MainNavigation() {
  const pathname = usePathname().slice('/dashboard/'.length);

  return (
    <nav className="flex h-full flex-col items-center gap-6 px-2 py-4">
      <TooltipProvider delayDuration={300}>
        <Link href="/dashboard" className="relative h-9 w-9">
          <span className="absolute h-full w-full" />
          <Logo />
        </Link>

        {MENU_ITEMS.map((props) => (
          <MenuItem
            key={props.path}
            active={pathname === props.path}
            {...props}
          />
        ))}

        <SignOutButton className="mt-auto rounded-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={itemClassNames}>
                <SignOut size="26" />
                <span className="sr-only">Log Out</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-accent/90">
              Log Out
            </TooltipContent>
          </Tooltip>
        </SignOutButton>
      </TooltipProvider>
    </nav>
  );
}
