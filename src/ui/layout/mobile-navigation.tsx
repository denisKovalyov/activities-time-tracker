'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Icon } from '@phosphor-icons/react';
import { MENU_ITEMS } from '@/ui/layout/constants';
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

  const handleAnimationEnd = () => setAnimationCompleted(true);

  useEffect(() => {
    setAnimationCompleted(false);
  }, [active]);

  const Item = (
    <>
      <IconComponent size="22" />
      <span className="sr-only">{text}</span>
    </>
  );

  const className = cn(
    'flex items-end mx-6 p-4 rounded-full text-white',
    active
      ? 'bg-accent text-white relative outline outline-8 outline-primary animate-bounce-finished relative'
      : 'hover:text-accent',
  );

  return active ? (
    <div className={className} onAnimationEndCapture={handleAnimationEnd}>
      {animationCompleted && (
        <span className="absolute left-[-10px] top-[-9px] -z-10 h-full w-[calc(100%+20px)] rounded-t-full bg-accent [clip-path:rect(0_70px_10px_0_round_0)]" />
      )}
      {Item}
    </div>
  ) : (
    <Link
      href={`/${path}`}
      className={className}
      onClick={handleAnimationEnd}
    >
      {Item}
    </Link>
  );
};

export const MobileNavigation = () => {
  const pathname = usePathname().slice(1);

  return (
    <nav className="relative flex h-full w-full items-center justify-center pb-1">
      {MENU_ITEMS
        // "toSorted" is used here only to put "Activities" item to the index "1" instead of "0"
        .toSorted((a, b) => a.order - b.order)
        .map(({ path, ...props }) => (
          <MenuItem
            key={path}
            active={pathname === path}
            path={path}
            {...props}
          />
        ))}
    </nav>
  );
};
