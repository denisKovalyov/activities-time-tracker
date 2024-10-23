import React, { createContext, ReactNode, useContext, useEffect, useState, Dispatch, SetStateAction } from 'react';

import { ActivityRecord } from '@/lib/definitions';
import { ActivitiesListWrapperProps } from '@/ui/dashboard/activities-list/types';
import { noop } from '@/lib/utils';

interface RecordContextProps {
  activeId: string | null;
  activitiesTimeMap: { [id: string]: number },
  setActiveId: Dispatch<SetStateAction<string | null>>,
  setActivitiesTimeMap: Dispatch<SetStateAction<{}>>,
}

export const Record = createContext<RecordContextProps>({
  activeId: null,
  setActiveId: noop,
  activitiesTimeMap: {},
  setActivitiesTimeMap: noop,
});

export const RecordProvider: React.FC<{
  activeActivity: ActivityRecord['current_activity'] | null;
  defaultActivitiesMap: ActivitiesListWrapperProps['activitiesTimeMap'],
  children: ReactNode;
}> = ({
  activeActivity,
  defaultActivitiesMap,
  children,
}) => {
  const [activitiesTimeMap, setActivitiesTimeMap] = useState(defaultActivitiesMap);
  const [activeId, setActiveId] = useState<string | null>(activeActivity?.[0] || null);

  useEffect(() => {
    setActiveId(activeActivity?.[0] || null);
  }, [activeActivity]);

  return (
    <Record.Provider
      value={{
        activeId,
        setActiveId,
        activitiesTimeMap,
        setActivitiesTimeMap,
      }}
    >
      {children}
    </Record.Provider>
  );
};

export const useRecord = () => {
  const context = useContext(Record);
  if (!context) {
    throw new Error('useRecord must be used within an RecordProvider');
  }
  return context;
};
