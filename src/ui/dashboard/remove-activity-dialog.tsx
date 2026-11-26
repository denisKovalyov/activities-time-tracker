'use client';

import { useTransition } from 'react';

import { DialogWrapper } from '@/ui/common/dialog';
import { Button } from '@/ui/common/button';
import { ActivityIcon } from '@/ui/dashboard/activity-icon';
import { deleteActivity } from '@/lib/actions/activities';
import { useRouter } from '@/ui/hooks/use-router';
import { useToast } from '@/ui/hooks/use-toast';
import type { Activity } from '@/lib/types';

export const RemoveActivityDialog = ({
  activities,
}: {
  activities: Activity[];
}) => {
  // Pending until the dialog is closed
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();
  const { router, pathname, searchParams } = useRouter();

  const activityId = searchParams.get('removeActivity');
  const showDialog = Boolean(activityId);
  const activity = activities.find(({ id }) => id === activityId);

  const redirect = () => router.push(pathname);

  const handleConfirm = () =>
    startTransition(async () => {
      const result = await deleteActivity(activityId!);

      toast({
        title: result.ok
          ? 'Activity was successfully removed!'
          : result.message,
        variant: result.ok ? 'success' : 'destructive',
      });

      redirect();
    });

  if (!activity) return;

  return (
    <DialogWrapper
      show={showDialog}
      onOpenChange={redirect}
      header={
        <span className="prose-xl flex justify-center text-primary">
          Remove Activity
        </span>
      }
      fullScreenMobile={false}
      content={
        <div className="flex flex-wrap items-center justify-center">
          <span>Remove&nbsp;</span>
          <span className="font-semibold">{activity.name}</span>
          <ActivityIcon
            className="mx-1"
            name={activity.icon}
            color={`#${activity.color}`}
          />
          <span>{'activity?'}</span>
        </div>
      }
      footer={
        <div className="flex w-full justify-end">
          <Button variant="outline" onClick={redirect}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="ml-2" loading={isPending}>
            Ok
          </Button>
        </div>
      }
    />
  );
};
