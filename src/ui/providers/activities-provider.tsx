'use client';

import React, {
  ReactNode,
  createContext,
  useContext,
} from 'react';

import { useRecord } from '@/ui/providers/record-provider';
import { ActivityExtended } from '@/lib/definitions';

interface ActivitiesContextProps {
  totalTimeSpent: number;
  activities: ActivityExtended[];
  activeActivity?: ActivityExtended;
}

const ActivitiesContext = createContext<ActivitiesContextProps>({
  totalTimeSpent: 0,
  activities: [],
});

export const ActivitiesProvider: React.FC<ActivitiesContextProps & { children: ReactNode }> = ({
  activities,
  totalTimeSpent,
  children,
}) => {
  const { activeId } = useRecord();

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        totalTimeSpent,
        activeActivity: activities.find(({ id }) => id === activeId),
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
};
