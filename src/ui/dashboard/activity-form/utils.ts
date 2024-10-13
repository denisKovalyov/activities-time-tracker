import { ActivityExtended } from '@/lib/definitions';

type ActivityForm = Pick<ActivityExtended, 'name' | 'color' | 'icon'>;
type ActivityKey = keyof ActivityForm;

export const checkActivityExists = (
  activity: ActivityForm,
  activitiesList: ActivityExtended[],
) =>
  activitiesList.find(
    ({ name, color, icon }) =>
      name === activity.name &&
      color === activity.color &&
      icon === activity.icon,
  );

export const retrieveUpdatedValues = (
  activitySaved: ActivityExtended,
  activityFormValues: ActivityForm,
) =>
  (Object.entries(activityFormValues) as [ActivityKey, string][]).reduce(
    (updatedValues, [name, value]) => {
      if (value !== activitySaved[name]) updatedValues[name] = value;
      return updatedValues;
    },
    {} as Partial<ActivityForm>,
  );
