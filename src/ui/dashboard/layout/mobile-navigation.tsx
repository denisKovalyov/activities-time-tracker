'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Icon } from '@phosphor-icons/react';
import { MENU_ITEMS } from '@/ui/dashboard/layout/constants';
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
    <>
      <IconComponent size="22"/>
      <span className="sr-only">{text}</span>
    </>
  );

  const className = cn('flex items-end mx-6 p-4 rounded-full text-white',
    active
      ? 'bg-accent text-white relative outline outline-8 outline-primary animate-bounce-finished relative'
      : 'hover:text-accent',
  );

  return (
    active
      ? (
        <div
          className={className}
          onAnimationEndCapture={handleAnimationEnd}
        >
          {animationCompleted && (
            <span className="absolute -z-10 top-[-9px] left-[-10px] w-[calc(100%+20px)] h-full rounded-t-full [clip-path:rect(0_70px_10px_0_round_0)] bg-accent" />
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
    <nav className="w-full h-full pb-1 flex justify-center items-center relative">
      {MENU_ITEMS
        .toSorted((a, b) => a.order - b.order)
        .map(({ path, ...props }) => (
          <MenuItem key={path} active={pathname === path} path={path} {...props} />
        ))
      }
    </nav>
  );
}
