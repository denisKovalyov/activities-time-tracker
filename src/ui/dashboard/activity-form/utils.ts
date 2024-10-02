import { Activity } from '@/lib/definitions';

export const checkActivityExists = (activity: Pick<Activity, 'name' | 'color' | 'icon'>, activitiesList: Activity[]) =>
  activitiesList.find(({ name, color, icon }) => name === activity.name && color === activity.color && icon === activity.icon);
