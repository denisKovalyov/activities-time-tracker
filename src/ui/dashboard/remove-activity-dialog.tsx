'use client';

import { useState } from 'react';

import { DialogWrapper } from '@/ui/common/dialog';
import { ActivityExtended } from '@/lib/definitions';
import { Button } from '@/ui/common/button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-card/activity-icon';
import { deleteActivity } from '@/lib/actions/activity';
import { refetchActivities } from '@/lib/actions/activity/app';
import { useRouter } from '@/ui/hooks/use-router';
import { useSession } from 'next-auth/react';
import { useToast } from '@/ui/hooks/use-toast';

export const RemoveActivityDialog = ({
  activities,
}: {
  activities: ActivityExtended[];
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();
  const { toast } = useToast();
  const { router, pathname, searchParams } = useRouter();

  const activityId = searchParams.get('removeActivity');

  const redirect = () => router.push(pathname);

  const handleCancel = () => redirect();
  const handleConfirm = async () => {
    setIsLoading(true);

    const result = await deleteActivity(session?.user?.id!, activityId!);

    toast({
      title: result?.message || 'Activity was successfully removed!',
      variant: result?.message ? 'destructive' : 'success',
    });

    if (result.success) {
      await refetchActivities();
    }

    redirect();
  };

  const showDialog = Boolean(activityId);
  const activity = activities.find(({ id }) => id === activityId);

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
          <span>{`Remove "${activity.name}"`}</span>
          <ActivityIcon
            className="mx-2"
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
