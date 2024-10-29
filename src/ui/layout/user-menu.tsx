import Link from 'next/link';
import { User } from '@phosphor-icons/react/dist/ssr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/common/dropdown-menu';
import { Button } from '@/ui/common/button';
import { SignOutButton } from '@/ui/layout/sign-out-button';

export const UserMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="overflow-hidden rounded-full border-primary"
      >
        <User size="18" className="overflow-hidden rounded-full" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <Link href="/settings">
        <DropdownMenuItem
          className="cursor-pointer"
        >
          Settings
        </DropdownMenuItem>
      </Link>
      <a href={`mailto:${process.env.APP_SUPPORT_EMAIL}?subject=${process.env.APP_SHORT_NAME}: Support Request`}>
        <DropdownMenuItem
          className="cursor-pointer"
        >
          Support
        </DropdownMenuItem>
      </a>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer"
      >
        <SignOutButton className="w-full rounded-sm text-left">
          <span>Logout</span>
        </SignOutButton>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
