import { ReactNode } from 'react';
import { MainNavigation } from '@/ui/dashboard/layout/main-navigation';
import { MobileNavigation } from '@/ui/dashboard/layout/mobile-navigation';
import { InputSearch } from '@/ui/dashboard/layout/input-search';
import { UserMenu } from '@/ui/dashboard/layout/user-menu';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <MainNavigation />
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header
          className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <MobileNavigation />
          <InputSearch />
          <UserMenu />
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
