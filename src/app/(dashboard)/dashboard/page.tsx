import { ActivityDialog } from '@/ui/dashboard/activity-dialog';
import { RemoveActivityDialog } from '@/ui/dashboard/remove-activity-dialog';
import { DashboardWrapper } from '@/ui/dashboard';

export default function Activities() {
  return (
    <>
      <DashboardWrapper />
      <ActivityDialog />
      <RemoveActivityDialog />
    </>
  );
}
