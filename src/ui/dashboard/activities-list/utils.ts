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

  const activitiesHashMap = updatedList.reduce((acc, { id, ...activity }) => ({
    [id]: activity,
    ...acc,
  }), {});

  return list.some(({ id, name, color, icon, is_archived, time_spent }) => {
    const updatedItem = activitiesHashMap[id];

    if (
      name !== updatedItem.name ||
      color !== updatedItem.color ||
      icon !== updatedItem.icon ||
      is_archived !== updatedItem.is_archived ||
      time_spent !== updatedItem.time_spent
    ) return true;
  });
};
