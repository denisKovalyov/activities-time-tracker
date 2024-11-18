'use client';

import React, {
  Dispatch,
  SetStateAction,
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { noop } from '@/lib/utils';
import { ActivityRecord } from '@/lib/definitions';

interface RecordContextProps {
  activityStartDate: string | null;
  activeId: string | null;
  activitiesTimeMap: { [id: string]: number },
  setActiveId: Dispatch<SetStateAction<string | null>>,
  updateActivitiesTimeMap: (id: string, totalSeconds: number) => void,
  resetActivitiesTimeMap: () => void,
}

const RecordContext = createContext<RecordContextProps>({
  activityStartDate: null,
  activeId: null,
  setActiveId: noop,
  activitiesTimeMap: {},
  updateActivitiesTimeMap: noop,
  resetActivitiesTimeMap: noop,
});

export const RecordProvider: React.FC<{
  activeActivity: ActivityRecord['current_activity'] | null;
  activitiesMap: {[id: string]: number};
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

  const updateActivitiesTimeMap = (id: string, totalSeconds: number) =>
    setActivitiesTimeMap((activitiesMap) => ({ ...activitiesMap, [id]: totalSeconds }));

  const resetActivitiesTimeMap = () => setActivitiesTimeMap((activitiesMap) =>
    Object.keys(activitiesMap).reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {})
  );

  return (
    <RecordContext.Provider
      value={{
        activityStartDate: activeActivity?.[1] || null,
        activeId,
        setActiveId,
        activitiesTimeMap,
        updateActivitiesTimeMap,
        resetActivitiesTimeMap,
      }}
    >
      {children}
    </RecordContext.Provider>
  );
};

export const useRecord = () => {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error('useRecord must be used within an RecordProvider');
  }
  return context;
};
