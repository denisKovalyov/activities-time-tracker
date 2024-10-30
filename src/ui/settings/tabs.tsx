import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/common/tabs';
import { useRouter } from '@/ui/hooks/use-router';
import { Account } from '@/ui/settings/account';
import { TabsProps } from '@/ui/settings/types';

const TABS = [
  { key: 'account', name: 'Account', component: <Account />},
  { key: 'password', name: 'Password', component: (<div className="p-4">Section is under construction. Please contact support for more details if needed.</div>)},
];

export function SettingsTabs({
  activeTab = TABS[0].key,
}: TabsProps) {
  const { router } = useRouter();

  const handleTabChange = (tabId: string) => {
    router.push(`?tab=${tabId}`);
  };

  return (
    <div>
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map(({ key, name}) => (
            <TabsTrigger key={key} value={key} className="font-semibold">{name}</TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(({ key, component}) => (
          <TabsContent key={key} value={key}>
            {component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
