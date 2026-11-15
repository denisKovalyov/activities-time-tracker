'use client';

import { useEffect, useState } from 'react';

import { DialogWrapper } from '@/ui/common/dialog';
import { Button } from '@/ui/common/button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-card/activity-icon';
import { deleteActivity } from '@/lib/actions/activities';
import { useRouter } from '@/ui/hooks/use-router';
import { useToast } from '@/ui/hooks/use-toast';
import { useActivities } from '@/ui/providers/activities-provider';

export const RemoveActivityDialog = () => {
  const activities = useActivities();
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { router, pathname, searchParams } = useRouter();

  const activityId = searchParams.get('removeActivity');
  const showDialog = Boolean(activityId);
  const activity = activities.find(({ id }) => id === activityId);

  useEffect(() => {
    if (showDialog) setIsLoading(false);
  }, [showDialog]);

  const redirect = () => router.push(pathname);

  const handleCancel = () => {
    redirect();
    setIsLoading(false);
  };
  const handleConfirm = async () => {
    setIsLoading(true);

    const result = await deleteActivity(activityId!);

    toast({
      title: result.ok ? 'Activity was successfully removed!' : result.message,
      variant: result.ok ? 'success' : 'destructive',
    });

    redirect();
  };

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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="ml-2" loading={isLoading}>
            Ok
          </Button>
        </div>
      }
    />
  );
};
