'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DialogWrapper } from '@/ui/common/dialog';
import { AddActivityForm } from '@/ui/dashboard/activity-form/add-activity-form';
import { revalidateActivities } from '@/lib/actions/activity/revalidation';
import { Activity } from '@/lib/definitions';

export const AddActivityDialog = ({
  activities,
}: {
  activities: Activity[],
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const showDialog = Boolean(searchParams.get('addNew'));
  const redirect = () => router.push(pathname);

  return (
    <DialogWrapper
      show={showDialog}
      onOpenChange={redirect}
      header={<span className="prose-xl mb-4 text-center text-primary">Add Activity</span>}
      subheader="Create an Activity to Monitor and Optimize Your Time"
      content={(
        <AddActivityForm
          activities={activities}
          onSubmit={revalidateActivities}
        />
      )}
    />
  );
}
