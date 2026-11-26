import { useCallback, useMemo, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';

import type { Activity, ActivityFields } from '@/lib/types';
import { ActivitySchema } from '@/lib/validation';
import { Button } from '@/ui/common/button';
import { Form, FormFieldInput } from '@/ui/common/form';
import { IconPicker } from '@/ui/dashboard/activity-form/icon-picker';
import {
  ColorPicker,
  getRandomColor,
} from '@/ui/dashboard/activity-form/color-picker';
import { LoadingOverlay } from '@/ui/common/loading-overlay';
import { createActivity, updateActivity } from '@/lib/actions/activities';
import { useToast } from '@/ui/hooks/use-toast';
import { matchFieldErrors } from '@/lib/utils/ui';
import {
  isDuplicate,
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
  activities: Activity[];
  activityId?: string | null;
}) {
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const editable = activityId
    ? activities.find(({ id }) => id === activityId)
    : null;

  const form = useForm<z.infer<typeof ActivitySchema>>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      name: editable?.name || '',
      color: editable?.color || getRandomColor(),
      icon: editable?.icon || '',
    },
  });

  const { control, setValue, trigger, setError } = form;

  const [name, color, icon] = useWatch({
    control,
    name: ['name', 'color', 'icon'],
  });

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

  const handleSubmit = (values: z.infer<typeof ActivitySchema>) => {
    if (isDuplicate(values, activities)) {
      toast({
        title: 'Activity already exists!',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result =
        activityId && changedValues
          ? await updateActivity(activityId, changedValues)
          : await createActivity(values);

      if (!result.ok) {
        if (result.fieldErrors) {
          matchFieldErrors<ActivityFields>(result.fieldErrors, setError);
        } else {
          toast({ title: result.message, variant: 'destructive' });
        }
        return;
      }

      onSubmit();

      toast({
        title: activityId ? ACTIVITY_EDIT_SUCCESS : ACTIVITY_ADD_SUCCESS,
        variant: 'success',
      });
    });
  };

  const disableSubmit = changedValues
    ? !Object.keys(changedValues).length
    : false;

  return (
    <div className="mx-auto w-2/3 min-w-64">
      <LoadingOverlay show={isPending} />

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
