'use client';

import { ReactNode, createContext, useContext } from 'react';

import type { Activity } from '@/lib/db/types';

const ActivitiesContext = createContext<Activity[] | null>(null);

// Activities of the user in their order, loaded in the dashboard layout.
export const ActivitiesProvider = ({
  activities,
  children,
}: {
  activities: Activity[];
  children: ReactNode;
}) => (
  <ActivitiesContext.Provider value={activities}>
    {children}
  </ActivitiesContext.Provider>
);

export const useActivities = () => {
  const activities = useContext(ActivitiesContext);
  if (!activities) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return activities;
};
