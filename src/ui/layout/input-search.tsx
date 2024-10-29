'use client';

import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/ui/common/form/input';
import { useRouter } from '@/ui/hooks/use-router';

const DEBOUNCE_DELAY = 300;

export const InputSearch = () => {
  const { router, searchParams, pathname } = useRouter();
  const search = searchParams.get('search');

  const [value, setValue] = useState(search || '');

  const handleSearch = () => {
    if (value) router.push(`/dashboard?search=${value}`);
    else router.push(pathname);
  }

  const handleReset = () => {
    setValue('');
    router.push(pathname);
  }

  const debouncedCallback = useDebouncedCallback(handleSearch, DEBOUNCE_DELAY);

  useEffect(() => {
    if (debouncedCallback.isPending()) return;
    setValue(search || '');
  }, [search, debouncedCallback]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValue(value);
    debouncedCallback();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="relative ml-auto flex-1 md:grow-0">
      <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
      <Input
        type="search"
        placeholder="Search..."
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {value && (
        <button
          type="button"
          onClick={handleReset}
          className="absolute bg-background w-3.5 h-3.5 right-3.5 top-3 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
