import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useStopwatch as useStopwatchHook } from 'react-timer-hook';
import debounce from 'debounce';

import { createNewRecord, getRecord as getRecordAction, updateRecord } from '@/lib/actions/record';
import { refetchActivities } from '@/lib/actions/activity/next-api';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { useRecord } from '@/ui/providers/record-provider';
import { updateState } from '@/ui/hooks/use-shared-stopwatch';
import { getSecondsPassed, padWithZero } from '@/lib/utils';

const DEBOUNCE_DELAY = 500;

const getOffset = (timeSpent: number) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + timeSpent);
  return date;
}

const isNextDay = (dateStr: string): boolean => new Date().getDate() !== new Date(dateStr).getDate();

const handleMidnightBorder = async (userId: string, activityId: string, seconds: number) => {
  const today = new Date();
  const yesterday = new Date();
  today.setSeconds(0);
  yesterday.setDate(yesterday.getDate() - 1);

  await Promise.all([
    updateRecord({
      userId,
      date: yesterday,
      currentActivity: null,
      activityRecord: [activityId, seconds],
    }),
    createNewRecord({
      userId,
      date: today,
      currentActivity: [activityId, today],
    }),
  ]);

  void refetchActivities();
}

const getRecord = async (userId: string, date: Date) => {
  const record = await getRecordAction(userId, date);
  const hasRecord = record && ('id' in record);
  return hasRecord ? record : null;
}

const startRecord = async ({ userId, currentActivity }: { userId: string, currentActivity: [string, Date] }) => {
  const record = await getRecord(userId, currentActivity[1]);
  const storedActivity = (record && 'current_activity' in record) ? record.current_activity : null;

  if (storedActivity?.[0] === currentActivity[0]) return;

  await (record ? updateRecord : createNewRecord)({
    userId,
    date: currentActivity[1],
    currentActivity,
  });

  void refetchActivities();
};

const stopRecord = async ({
  userId,
  date,
  currentActivity,
  activityRecord,
}: {
  userId: string;
  date: Date;
  activityRecord: [string, number];
  currentActivity: [string, Date] | null;
}) => {
  const record = await getRecord(userId, date);

  await (record ? updateRecord : createNewRecord)({
    userId,
    date: date,
    currentActivity,
    activityRecord,
  });

  void refetchActivities();
}

const debouncedStart = debounce(startRecord, DEBOUNCE_DELAY);

export const useStopwatch = (activityId: string) => {
  const { data: session } = useSession();

  const {
    activityStartDate,
    activeId,
    setActiveId,
    activitiesTimeMap,
    updateActivitiesTimeMap,
    resetActivitiesTimeMap,
  } = useRecord();

  const userId = session?.user?.id!;
  const isActive = activeId === activityId;
  const timeSpent = activitiesTimeMap[activityId];

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatchHook({
    offsetTimestamp: getOffset(timeSpent + (isActive ? getSecondsPassed(activityStartDate) : 0)),
  });

  useEffect(() => {
    if (isActive && userId && !isRunning) {
      start();
      void debouncedStart({ userId, currentActivity: [activityId, new Date()] });
    }

    if (!isActive && userId && isRunning) {
      pause();
      updateActivitiesTimeMap(activityId, totalSeconds);
      const date = new Date();
      void stopRecord({
        userId,
        date,
        currentActivity: activeId ? [activeId, date] : null,
        activityRecord: [activityId, totalSeconds],
      });
    }
  }, [
    isActive,
    isRunning,
    userId,
    activeId,
    activityId,
    totalSeconds,
    start,
    pause,
    updateActivitiesTimeMap,
  ]);

  // Handle midnight
  useEffect(() => {
    if (isActive && activityStartDate && isNextDay(activityStartDate)) {
      void handleMidnightBorder(userId, activityId, totalSeconds - 1);
      resetActivitiesTimeMap();
      reset();
    }
  }, [
    isActive,
    userId,
    activityId,
    totalSeconds,
    activityStartDate,
    reset,
    resetActivitiesTimeMap,
  ]);

  // Handle shared stopwatch
  useEffect(() => {
    if (!isActive) return;
    updateState(totalSeconds - timeSpent);
  }, [isActive, totalSeconds, timeSpent]);

  const onStartStop = () => {
    setActiveId((activeId) =>
      activeId === activityId ? null : activityId
    );
  }

  const timeValues = useCalculateTimeValues(timeSpent);

  return {
    isActive,
    onStartStop,
    seconds: isActive ? padWithZero(seconds) : timeValues[2],
    minutes: isActive ? padWithZero(minutes) : timeValues[1],
    hours: isActive ? padWithZero(hours) : timeValues[0],
  }
}
