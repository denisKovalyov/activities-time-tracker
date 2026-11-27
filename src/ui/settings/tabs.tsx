'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/common/tabs';
import { useNavigation } from '@/ui/hooks/use-navigation';
import { Account } from '@/ui/settings/account';
import { AccountDetails, TabsProps } from '@/ui/settings/types';

const TABS = [
  {
    key: 'account',
    name: 'Account',
    render: (account?: AccountDetails) => <Account account={account} />,
  },
  {
    key: 'password',
    name: 'Password',
    render: () => (
      <div className="p-4">
        Section is under construction. Please contact support for more details
        if needed.
      </div>
    ),
  },
];

export function SettingsTabs({ activeTab = TABS[0].key, account }: TabsProps) {
  const { router } = useNavigation();

  const handleTabChange = (tabId: string) => {
    router.push(`?tab=${tabId}`);
  };

  return (
    <div>
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map(({ key, name }) => (
            <TabsTrigger key={key} value={key} className="font-semibold">
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(({ key, render }) => (
          <TabsContent key={key} value={key}>
            {render(account)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
