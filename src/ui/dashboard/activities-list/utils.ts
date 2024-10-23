import { ActivityExtended } from '@/lib/definitions';

export const getReorderedActivities = (activitiesList: ActivityExtended[], reorderedActivitiesList: ActivityExtended[]) => {
  const result: { id: string; order: number }[] = [];

  reorderedActivitiesList.forEach(({ id }, index) => {
    if (id !== activitiesList[index].id) result.push({ id, order: index });
  });

  return result;
};

export const isListHasChanged = (list: ActivityExtended[], updatedList: ActivityExtended[]) => {
  if (list.length !== updatedList.length) return true;

  return list.some(({ updated_at: updatedAt, timeSpent }, index) => {
    const updatedItem = updatedList[index];
    if (+updatedAt !== +updatedItem.updated_at || timeSpent !== updatedItem.timeSpent) return true;
  });
};
