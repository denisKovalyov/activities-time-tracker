import { SettingsTabs } from '@/ui/settings/tabs';

export default async function Settings({ searchParams }: { searchParams: Promise<{tab?: string}> }) {
  const activeTab = (await searchParams).tab;

  return (<SettingsTabs activeTab={activeTab} />);
}
