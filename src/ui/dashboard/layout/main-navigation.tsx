import Link from 'next/link';
import {
  SignOut,
} from '@phosphor-icons/react/dist/ssr';
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

const MenuItem = ({
  text,
  path,
  icon: IconComponent,
}: {
  text: string;
  path: string;
  icon: Icon;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        href={`/dashboard/${path}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
      >
        <IconComponent size="24" />
        <span className="sr-only">{text}</span>
      </Link>
    </TooltipTrigger>
    <TooltipContent side="right">{text}</TooltipContent>
  </Tooltip>
);

export function MainNavigation() {
  return (
    <nav className="flex h-full flex-col items-center gap-4 px-2 py-4">
      <TooltipProvider delayDuration={300}>
        <Link
          href="/dashboard"
          className="h-9 w-9 relative"
        >
          <span className="absolute w-full h-full" />
          <Logo />
        </Link>

        {MENU_ITEMS.map((props) => (
          <MenuItem key={props.path} {...props} />
        ))}

        <SignOutButton className="mt-auto rounded-lg">
          <Tooltip>
            <TooltipTrigger asChild>
            <span className='flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'>
              <SignOut size="24"/>
              <span className="sr-only">Log Out</span>
            </span>
            </TooltipTrigger>
            <TooltipContent side="right">Log Out</TooltipContent>
          </Tooltip>
        </SignOutButton>
      </TooltipProvider>
    </nav>
  );
}
