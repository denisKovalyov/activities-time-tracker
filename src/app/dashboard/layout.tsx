import { ReactNode } from 'react';
import { MainNavigation } from '@/ui/dashboard/layout/main-navigation';
import { MobileNavigation } from '@/ui/dashboard/layout/mobile-navigation';
import { InputSearch } from '@/ui/dashboard/layout/input-search';
import { UserMenu } from '@/ui/dashboard/layout/user-menu';
import { PageName } from '@/ui/dashboard/layout/page-name';
import { Logo } from '@/ui/common/logo';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full flex-col">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r border-secondary sm:flex">
        <MainNavigation />
      </aside>
      <div className="flex h-full flex-col justify-stretch sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 flex-none items-center gap-4 border-b border-primary bg-background px-4 dark:border-primary sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <span className="h-9 w-9 shrink-0 sm:hidden md:h-8 md:w-8 md:text-base">
            <Logo />
          </span>
          <div className="hidden w-20 pr-2 sm:block">
            <PageName />
          </div>
          <InputSearch />
          <UserMenu />
        </header>

        <main className="h-[calc(100%-112px)] overflow-auto p-4 sm:h-full sm:pb-0">
          {children}
        </main>

        <footer className="relative z-10 mt-auto h-14 border-t border-accent bg-primary px-4 sm:hidden">
          <MobileNavigation />
        </footer>
      </div>
    </div>
  );
}
