import { ActivityExtended } from '@/lib/definitions';

export const getReorderedActivities = (activitiesList: ActivityExtended[], reorderedActivitiesList: ActivityExtended[]) => {
  const result: { id: string; order: number }[] = [];

  reorderedActivitiesList.forEach(({ id }, index) => {
    if (id !== activitiesList[index].id) result.push({ id, order: index });
  });

  return result;
}

export const getLatestUpdateTimestamp = (activitiesList: ActivityExtended[]) => {
  let timestamp = 0;

  activitiesList.forEach(({ updated_at: updatedAt }) => {
    if (+updatedAt > timestamp) timestamp = +updatedAt;
  });

  return timestamp;
}
