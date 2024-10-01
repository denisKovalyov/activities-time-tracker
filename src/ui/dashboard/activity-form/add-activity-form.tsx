'use client';

import { useCallback, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';

import { Activity } from '@/lib/definitions';
import { ActivitySchema } from '@/lib/validation';
import { Button } from '@/ui/common/button';
import { Form, FormFieldInput } from '@/ui/common/form';
import { IconPicker } from '@/ui/dashboard/activity-form/icon-picker';
import { ColorPicker } from '@/ui/dashboard/activity-form/color-picker';
import { LoadingOverlay } from '@/ui/common/loading-overlay';
import { createActivity } from '@/lib/actions/activity';
import { useToast } from '@/ui/hooks/use-toast';
import { matchFieldErrors } from '@/ui/utils';
import './hex-color-picker.css';

export function AddActivityForm({
  onSubmit,
  activitiesNumber,
}: {
  onSubmit: () => void;
  activitiesNumber: number;
}) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ActivitySchema>>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      name: '',
      color: '',
      icon: '',
    },
  });

  const {
    watch,
    setValue,
    trigger,
    setError,
  } = form;

  const [color, icon] = watch(['color', 'icon']);

  const handleColorChange = useCallback((value: string) => {
    setValue('color', value.slice(1));
    void trigger('color');
  }, [setValue, trigger]);

  const handleIconChange = useCallback((iconName: string) => {
    setValue('icon', iconName);
    void trigger('icon');
  }, [setValue, trigger]);

  const handleSubmit = async (values: z.infer<typeof ActivitySchema>) => {
    const userId = session?.user?.id!;
    setIsLoading(true);

    const result = await createActivity({
      ...values,
      user_id: userId,
      order: activitiesNumber,
    });

    if ('errors' in result && result.errors) {
      matchFieldErrors<Partial<Pick<Activity, 'name' | 'color' | 'icon'>>>(
        result.errors, setError,
      );
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
      title: 'Activity was successfully added!',
      variant: 'success',
    });
  };

  return (
    <div className="w-2/3 min-w-64 mx-auto">
      <LoadingOverlay show={isLoading} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="[&>div]:mb-4 flex flex-col">
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

          <Button type="submit" className="mt-auto w-full">
            Create Activity
          </Button>
        </form>
      </Form>
    </div>
  );
}
