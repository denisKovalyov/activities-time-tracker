import Link from 'next/link';
import type { Icon } from '@phosphor-icons/react';
import { MENU_ITEMS } from '@/ui/dashboard/layout/constants';
import { Sheet, SheetContent, SheetTrigger } from '@/ui/common/sheet';
import { Button } from '@/ui/common/button';
import { SidebarSimple } from '@phosphor-icons/react/dist/ssr';

const MenuItem = ({
  text,
  path,
  icon: IconComponent,
}: {
  text: string;
  path: string;
  icon: Icon;
}) => (
  <SheetTrigger asChild>
    <Link
      href={`/dashboard/${path}`}
      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
    >
      <IconComponent size="24" />
      <span>{text}</span>
      <span className="sr-only">{text}</span>
    </Link>
  </SheetTrigger>
);

export const MobileNavigation = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button size="icon" variant="outline" className="sm:hidden">
        <SidebarSimple size="24" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="sm:max-w-xs">
      <nav className="grid gap-6 text-lg font-medium">
        {MENU_ITEMS.map((props) => (
          <MenuItem key={props.path} {...props} />
        ))}
      </nav>
    </SheetContent>
  </Sheet>
);
