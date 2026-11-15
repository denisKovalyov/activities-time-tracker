import 'server-only';

import { getActivities as dbGetActivities } from '@/lib/actions/data/activity';
import {
  getRecord as dbGetRecord,
  getRecords as dbGetRecords,
} from '@/lib/actions/data/record';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { Activity, ActivityExtended, ActivityRecord } from '@/lib/definitions';

export async function getActivities(
  userId: string,
  date: Date,
): Promise<ActivityExtended[] | { message: string }> {
  try {
    const [record, activities]: [ActivityRecord | undefined, Activity[] | []] =
      await Promise.all([dbGetRecord(userId, date), dbGetActivities(userId)]);

    return activities.map((activity) => ({
      ...activity,
      time_spent: record?.activities?.[activity.id] || 0,
    }));
  } catch (error: unknown) {
    return { message: 'Something went wrong.' };
  }
}

export async function getActivitiesRange(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<ActivityExtended[] | { message: string }> {
  try {
    const [records, activities]: [ActivityRecord[] | [], Activity[] | []] =
      await Promise.all([
        dbGetRecords(userId, startDate, endDate),
        dbGetActivities(userId),
      ]);

    const recordsTotal: Record<string, number> = {};
    records.forEach(({ activities }) => {
      Object.entries(activities).forEach(
        ([id, value]) => (recordsTotal[id] = (recordsTotal[id] || 0) + value),
      );
    });

    return activities.map((activity) => ({
      ...activity,
      time_spent: recordsTotal[activity.id] || 0,
    }));
  } catch (error: unknown) {
    return {
      message:
        error instanceof Error
          ? (error?.message as string)
          : DEFAULT_ERROR_MESSAGE,
    };
  }
}
