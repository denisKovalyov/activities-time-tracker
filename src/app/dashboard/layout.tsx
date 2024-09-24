import { ReactNode } from 'react';
import { MainNavigation } from '@/ui/dashboard/layout/main-navigation';
import { MobileNavigation } from '@/ui/dashboard/layout/mobile-navigation';
import { InputSearch } from '@/ui/dashboard/layout/input-search';
import { UserMenu } from '@/ui/dashboard/layout/user-menu';
import { PageName } from '@/ui/dashboard/layout/page-name';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col bg-muted/40 ">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <MainNavigation/>
      </aside>
      <div className="h-full flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header
          className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-secondary bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <span
            className="sm:hidden flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
            Logo
          </span>
          <div className="hidden sm:block w-20 pr-2">
            <PageName/>
          </div>
          <InputSearch/>
          <UserMenu/>
        </header>
        <main className="h-[calc(100vh-28rem)]">
          {children}
        </main>
      </div>
      <footer className="sm:hidden h-14 px-4 bg-background border-t border-secondary">
        <MobileNavigation />
      </footer>
    </div>
  );
}
