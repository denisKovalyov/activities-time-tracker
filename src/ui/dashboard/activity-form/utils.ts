import type { Activity, ActivityFields } from '@/lib/types';

type ActivityForm = ActivityFields;
type ActivityKey = keyof ActivityForm;

export const isDuplicate = (
  activity: ActivityForm,
  activitiesList: Activity[],
) =>
  activitiesList.some(
    ({ name, color, icon }) =>
      name === activity.name &&
      color === activity.color &&
      icon === activity.icon,
  );

export const retrieveUpdatedValues = (
  activitySaved: Activity,
  activityFormValues: ActivityForm,
) =>
  (Object.entries(activityFormValues) as [ActivityKey, string][]).reduce(
    (updatedValues, [name, value]) => {
      if (value !== activitySaved[name]) updatedValues[name] = value;
      return updatedValues;
    },
    {} as Partial<ActivityForm>,
  );
