import { ReactNode, Suspense } from 'react';
import { auth } from '@/auth';

import { MainNavigation } from '@/ui/layout/main-navigation';
import { MobileNavigation } from '@/ui/layout/mobile-navigation';
import { InputSearch } from '@/ui/layout/input-search';
import { UserMenu } from '@/ui/layout/user-menu';
import { PageName } from '@/ui/layout/page-name';
import { Logo } from '@/ui/common/logo';
import { SetCookies } from '@/ui/layout/set-cookies';
import { ActivitiesProvider } from '@/ui/providers/activities-provider';
import { RecordProvider } from '@/ui/providers/record-provider';
import { getSecondsPassed } from '@/lib/utils';
import { getActivities } from '@/lib/actions/activity';
import { getRecord } from '@/lib/actions/record';
import { retrieveDateFromCookies } from '@/app/(dashboard)/next-api-helpers';

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id!;
  const date = await retrieveDateFromCookies();

  const [activities, record] = await Promise.all([
    getActivities(userId!, date),
    getRecord(userId!, date),
  ]);

  if ('message' in activities) return null;

  const activeActivity =  record && 'current_activity' in record ? record.current_activity : null;

  let totalTimeSpent = getSecondsPassed(activeActivity?.[1]);
  const activitiesTimeMap = activities.reduce((acc, curr) => {
    const value = curr.time_spent;
    totalTimeSpent += value;
    return { ...acc, [curr.id]: value };
  }, {});


  return (
    <div className="flex h-dvh w-full flex-col">
      <SetCookies />

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

          <Suspense>
            <InputSearch />
          </Suspense>

          <UserMenu />
        </header>

        <main className="h-[calc(100%-112px)] overflow-auto p-4 sm:h-full sm:pb-0">
          <RecordProvider
            activeActivity={activeActivity}
            activitiesMap={activitiesTimeMap}
            totalTimeSpent={totalTimeSpent}
          >
            <ActivitiesProvider
              activities={activities}
              totalTimeSpent={totalTimeSpent}
            >
              {children}
            </ActivitiesProvider>
          </RecordProvider>
        </main>

        <footer className="relative z-10 mt-auto h-14 border-t border-accent bg-primary px-4 sm:hidden">
          <MobileNavigation />
        </footer>
      </div>
    </div>
  );
}
