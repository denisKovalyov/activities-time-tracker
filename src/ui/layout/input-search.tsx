'use client';

import { ChangeEvent, useState } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

import { Input } from '@/ui/common/form/input';
import { useRouter } from '@/ui/hooks/use-router';

const DASHBOARD_PATH = '/dashboard';

// The search filters activities on the client, so on the dashboard the URL
// is updated without a request to the server. On other pages the search
// opens the dashboard.
export const InputSearch = () => {
  const { router, searchParams, pathname } = useRouter();
  const search = searchParams.get('search') ?? '';

  const [value, setValue] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);

  // Shows the search from the URL, e.g. after navigation
  if (search !== prevSearch) {
    setPrevSearch(search);
    setValue(search);
  }

  const updateSearch = (value: string) => {
    setValue(value);
    const url = value
      ? `${DASHBOARD_PATH}?${new URLSearchParams({ search: value })}`
      : pathname;

    if (pathname === DASHBOARD_PATH) window.history.replaceState(null, '', url);
    else if (value) router.push(url);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    updateSearch(e.target.value);
  const handleReset = () => updateSearch('');

  return (
    <div className="relative ml-auto flex-1 md:grow-0">
      <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        value={value}
        onChange={handleChange}
      />
      {value && (
        <button
          type="button"
          onClick={handleReset}
          className="absolute right-3.5 top-3 h-3.5 w-3.5 cursor-pointer bg-background"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
