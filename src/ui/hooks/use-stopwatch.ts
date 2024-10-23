import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useStopwatch as useStopwatchHook } from 'react-timer-hook';

import { createNewRecord, getRecord, updateRecord } from '@/lib/actions/record';
import { refetchActivities } from '@/lib/actions/activity/app';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { useRecord } from '@/ui/dashboard/activities-list/providers/record';
import { padWithZero } from '@/ui/utils';

const getOffset = (timeSpent: number) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + timeSpent);
  return date;
}

export const useStopwatch = (activityId: string) => {
  const {
    activeId,
    setActiveId,
    activitiesTimeMap,
    setActivitiesTimeMap,
  } = useRecord();

  const isActive = activeId === activityId;
  const timeSpent = activitiesTimeMap[activityId];

  const [offset, setOffset] = useState<Date | undefined>(getOffset(timeSpent));

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
  } = useStopwatchHook({ offsetTimestamp: offset });

  useEffect(() => {
    if (!timeSpent) return;
    const date = new Date();
    date.setSeconds(date.getSeconds() + activitiesTimeMap[activityId]);
    setOffset(date);
  }, [timeSpent]);

  useEffect(() => {
    if (isActive && userId && !isRunning) {
      void startRecord(userId);
    }

    if (!isActive && userId && isRunning) {
      void stopRecord(userId);
    }
  }, [isActive, isRunning, userId, pause]);

  const startRecord = async (userId: string) => {
    start();

    const record = await getRecord(userId);
    const hasRecord = record && ('id' in record);
    const currentActivity = hasRecord ? record.current_activity : null;

    if (currentActivity?.[0] === activityId) return;

    await (hasRecord ? updateRecord : createNewRecord)(userId, activityId);
  }

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
    await refetchActivities();
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
    seconds: isRunning ? padWithZero(seconds) : timeValues[2],
    minutes: isRunning ? padWithZero(minutes) : timeValues[1],
    hours: isRunning ? padWithZero(hours) : timeValues[0],
  }
}
