import type { Activity, ActivityFields } from '@/lib/db/types';

type ActivityForm = ActivityFields;
type ActivityKey = keyof ActivityForm;

export const checkActivityExists = (
  activity: ActivityForm,
  activitiesList: Activity[],
) =>
  activitiesList.find(
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
