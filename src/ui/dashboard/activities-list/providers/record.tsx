import React, {
  Dispatch,
  SetStateAction,
  ReactNode,
  createContext,
  useContext,
  useState, useEffect,
} from 'react';

import { ActivityRecord } from '@/lib/definitions';
import { ActivitiesListWrapperProps } from '@/ui/dashboard/activities-list/types';
import { noop } from '@/lib/utils';

interface RecordContextProps {
  runningTimestamp: string | null;
  activeId: string | null;
  activitiesTimeMap: { [id: string]: number },
  setActiveId: Dispatch<SetStateAction<string | null>>,
  setActivitiesTimeMap: Dispatch<SetStateAction<{}>>,
}

export const Record = createContext<RecordContextProps>({
  runningTimestamp: null,
  activeId: null,
  setActiveId: noop,
  activitiesTimeMap: {},
  setActivitiesTimeMap: noop,
});

export const RecordProvider: React.FC<{
  activeActivity: ActivityRecord['current_activity'] | null;
  activitiesMap: ActivitiesListWrapperProps['activitiesTimeMap'];
  totalTimeSpent: number;
  children: ReactNode;
}> = ({
  activeActivity,
  activitiesMap,
  totalTimeSpent,
  children,
}) => {
  const [activitiesTimeMap, setActivitiesTimeMap] = useState(activitiesMap);
  const [previousNumber, setPreviousNumber] = useState(Object.keys(activitiesMap).length);
  const [activeId, setActiveId] =
    useState<string | null>(activeActivity?.[0] || null);

  useEffect(() => {
    const currentNumber = Object.keys(activitiesMap).length;
    if (currentNumber !== previousNumber) {
      setActivitiesTimeMap(activitiesMap);
      setPreviousNumber(currentNumber);
    }
  }, [activitiesMap, previousNumber, totalTimeSpent, setPreviousNumber]);

  return (
    <Record.Provider
      value={{
        runningTimestamp: activeActivity?.[1] || null,
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
