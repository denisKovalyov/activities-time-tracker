'use client';

import { Suspense } from 'react';

import { SettingsTabs } from '@/ui/settings/tabs';
import { TabsProps } from '@/ui/settings/types';

export const PageWrapper = (props: TabsProps) => {
  return (
    <Suspense>
      <SettingsTabs {...props} />
    </Suspense>
  )
}
