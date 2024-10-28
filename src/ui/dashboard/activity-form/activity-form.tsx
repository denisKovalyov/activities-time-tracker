'use client';

import { useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';

import { ActivityExtended } from '@/lib/definitions';
import { ActivitySchema } from '@/lib/validation';
import { Button } from '@/ui/common/button';
import { Form, FormFieldInput } from '@/ui/common/form';
import { IconPicker } from '@/ui/dashboard/activity-form/icon-picker';
import { ColorPicker } from '@/ui/dashboard/activity-form/color-picker';
import { LoadingOverlay } from '@/ui/common/loading-overlay';
import { createActivity, updateActivity } from '@/lib/actions/activity';
import { useToast } from '@/ui/hooks/use-toast';
import { matchFieldErrors } from '@/lib/utils';
import {
  checkActivityExists,
  retrieveUpdatedValues,
} from '@/ui/dashboard/activity-form/utils';
import './hex-color-picker.css';

const ACTIVITY_ADD_SUCCESS = 'Activity was successfully added!';
const ACTIVITY_EDIT_SUCCESS = 'Activity was successfully saved!';

export function ActivityForm({
  onSubmit,
  activities,
  activityId,
}: {
  onSubmit: () => void;
  activities: ActivityExtended[];
  activityId?: string | null;
}) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const editable = activityId
    ? activities.find(({ id }) => id === activityId)
    : null;

  const form = useForm<z.infer<typeof ActivitySchema>>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      name: editable?.name || '',
      color: editable?.color || '',
      icon: editable?.icon || '',
    },
  });

  const { watch, setValue, trigger, setError } = form;

  const [name, color, icon] = watch(['name', 'color', 'icon']);

  const changedValues = useMemo(
    () =>
      editable ? retrieveUpdatedValues(editable, { name, color, icon }) : null,
    [editable, name, color, icon],
  );

  const handleColorChange = useCallback(
    (value: string) => {
      setValue('color', value.slice(1));
      void trigger('color');
    },
    [setValue, trigger],
  );

  const handleIconChange = useCallback(
    (iconName: string) => {
      setValue('icon', iconName);
      void trigger('icon');
    },
    [setValue, trigger],
  );

  const handleSubmit = async (values: z.infer<typeof ActivitySchema>) => {
    const isExist = checkActivityExists(values, activities);

    if (isExist) {
      toast({
        title: 'Activity already exists!',
        variant: 'destructive',
      });
      return;
    }

    const userId = session?.user?.id!;
    setIsLoading(true);

    const result =
      activityId && changedValues
        ? await updateActivity(activityId, changedValues)
        : await createActivity({
            ...values,
            user_id: userId,
            order: activities.reduce((acc, { order }) => acc > order ? acc : order, 0) + 1,
          });

    if ('errors' in result && result.errors) {
      matchFieldErrors<
        Partial<Pick<ActivityExtended, 'name' | 'color' | 'icon'>>
      >(result.errors, setError);
      setIsLoading(false);
      return;
    }

    if ('message' in result) {
      toast({
        title: result.message,
        variant: 'destructive',
      });

      setIsLoading(false);
      return;
    }

    onSubmit();

    toast({
      title: activityId ? ACTIVITY_EDIT_SUCCESS : ACTIVITY_ADD_SUCCESS,
      variant: 'success',
    });
  };

  const disableSubmit = changedValues
    ? !Object.keys(changedValues).length
    : false;

  return (
    <div className="mx-auto w-2/3 min-w-64">
      <LoadingOverlay show={isLoading} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col [&>div]:mb-4"
        >
          <FormFieldInput name="name" label="Name" />

          <ColorPicker
            name="color"
            label="Color"
            value={color}
            onColorChange={handleColorChange}
          />

          <FormFieldInput
            name="icon"
            label="Icon"
            renderCustomInput={(className) => (
              <IconPicker
                selected={icon}
                onSelect={handleIconChange}
                className={className}
              />
            )}
          />

          <Button
            type="submit"
            className="mt-auto w-full"
            disabled={disableSubmit}
          >
            {`${activityId ? 'Save' : 'Create'} Activity`}
          </Button>
        </form>
      </Form>
    </div>
  );
}
