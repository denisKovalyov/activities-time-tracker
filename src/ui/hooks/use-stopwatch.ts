import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useStopwatch as useStopwatchHook } from 'react-timer-hook';
import debounce from 'debounce';

import { createNewRecord, getRecord, updateRecord } from '@/lib/actions/record';
import { refetchActivities } from '@/lib/actions/activity/app';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { useRecord } from '@/ui/dashboard/activities-list/providers/record';
import { padWithZero } from '@/ui/utils';
import { getSecondsPassed } from '@/lib/actions/data/utils';

const DEBOUNCE_DELAY = 400;

const getOffset = (timeSpent: number) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + timeSpent);
  return date;
}

const debouncedStart = debounce(
  async (start: () => void, activityId: string, userId: string) => {
    start();

    const record = await getRecord(userId);
    const hasRecord = record && ('id' in record);
    const currentActivity = hasRecord ? record.current_activity : null;

    if (currentActivity?.[0] === activityId) return;

    await (hasRecord ? updateRecord : createNewRecord)(userId, activityId);
  }, DEBOUNCE_DELAY);

export const useStopwatch = (activityId: string) => {
  const {
    runningTimestamp,
    activeId,
    setActiveId,
    activitiesTimeMap,
    setActivitiesTimeMap,
  } = useRecord();

  const isActive = activeId === activityId;
  const timeSpent = activitiesTimeMap[activityId];

  const { data: session } = useSession();
  const userId = session?.user?.id!;

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
  } = useStopwatchHook({
    offsetTimestamp: getOffset(timeSpent + (isActive ? getSecondsPassed(runningTimestamp) : 0)),
  });

  useEffect(() => {
    if (isActive && userId && !isRunning) {
      void debouncedStart(start, activityId, userId);
    }

    if (!isActive && userId && isRunning) {
      void stopRecord(userId);
    }
  }, [isActive, isRunning, userId, start]);

  const stopRecord = async (userId: string) => {
    pause();

    setActivitiesTimeMap((activitiesMap) => ({
      ...activitiesMap,
      [activityId]: totalSeconds,
    }));

    const record = await getRecord(userId);
    const hasRecord = record && 'id' in record;

    // "createNewRecord" is used here as a fallback if no record was created
    await (hasRecord ? updateRecord : createNewRecord)(
      userId,
      activeId || null,
      [activityId, totalSeconds],
    );
    void refetchActivities();
  }

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
