import { PageWrapper } from '@/ui/settings';

export default async function Settings({ searchParams }: { searchParams: Promise<{tab?: string}> }) {
  const activeTab = (await searchParams).tab;

  return (<PageWrapper activeTab={activeTab} />);
}
