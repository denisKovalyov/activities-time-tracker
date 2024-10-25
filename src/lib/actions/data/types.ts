export type CreateUpdateRecordParams = {
  userId: string;
  date: Date;
  currentActivity: [string, Date] | null;
  activityRecord?: [string, number] | null;
};
