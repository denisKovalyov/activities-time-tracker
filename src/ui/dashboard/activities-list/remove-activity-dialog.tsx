'use client';

import { DialogWrapper } from '@/ui/common/dialog';
import { Activity } from '@/lib/definitions';
import { Button } from '@/ui/common/button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-icon';

export const RemoveActivityDialog = ({
  show,
  activity,
  onOpenChange,
  loading,
  onConfirm,
}: {
  show: boolean;
  onOpenChange: (value: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  activity: Pick<Activity, 'id' | 'name' | 'color' | 'icon'>;
}) => {
  return (
    <DialogWrapper
      show={show}
      header={
        <span className="prose-xl flex justify-center text-primary">
          Remove Activity
        </span>
      }
      onOpenChange={onOpenChange}
      fullScreenMobile={false}
      content={
        <div className="flex flex-wrap items-center justify-center">
          <span>{`Delete "${activity.name}"`}</span>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="ml-2" loading={loading}>
            Ok
          </Button>
        </div>
      }
    />
  );
};
