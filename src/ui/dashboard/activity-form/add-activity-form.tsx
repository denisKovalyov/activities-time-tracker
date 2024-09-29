'use client';

import { useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { HexColorPicker  } from 'react-colorful';
import { Palette } from '@phosphor-icons/react';

import { ActivityForm } from '@/lib/definitions';
import { ActivitySchema } from '@/lib/validation';
import { Button } from '@/ui/common/button';
import { Form, FormFieldInput } from '@/ui/common/form';
import { IconPicker } from '@/ui/dashboard/activity-form/icon-picker/icon-picker';
import { InputIcon } from '@/ui/common/form/input-icon';
import { createActivity, getActivities } from '@/lib/actions/activity';
import { getRandomValue } from '@/lib/utils';
import './hex-color-picker.css';
import {useSession} from 'next-auth/react';

const BASIC_COLORS = [
  "#FF5733", // Bright Orange
  "#33FF57", // Lime Green
  "#3357FF", // Bright Blue
  "#FF33A1", // Hot Pink
  "#33FFF5", // Aqua
  "#FFB833", // Golden Yellow
  "#8033FF", // Purple
  "#33FF83", // Light Green
  "#FF3333", // Red
  "#33A1FF", // Sky Blue
  "#FF5733", // Coral
  "#A833FF", // Violet
  "#FFD633", // Sunflower Yellow
  "#FF33B8", // Pink
  "#33FFAD", // Mint Green
];


export function AddActivityForm({
  onSubmit,
  activitiesNumber,
}: {
  onSubmit: () => void;
  activitiesNumber: number;
}) {
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof ActivitySchema>>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      name: '',
      color: '',
      icon: '',
    },
  });

  const {
    setValue,
    trigger,
    control,
    setError,
  } = form;

  const color = useWatch({ name: 'color', control });
  const icon = useWatch({ name: 'icon', control });

  const handleColorChange = useCallback((value: string) => {
    setValue('color', value.slice(1));
    void trigger('color');
  }, [form]);

  useEffect(() => {
    handleColorChange(getRandomValue(BASIC_COLORS));
  }, [handleColorChange]);

  const handleIconChange = (iconName: string) => {
    setValue('icon', iconName);
    void trigger('icon');
  }

  const handleSubmit = async (values: z.infer<typeof ActivitySchema>) => {
    const userId = session?.user?.id!;

    const result = await createActivity({
      ...values,
      user_id: userId,
      order: activitiesNumber,
    });

    if (result && typeof result === 'object' && 'errors' in result) {
      (
        Object.entries(result.errors!) as [keyof Pick<ActivityForm, 'name' | 'color' | 'icon'>, string[]][]
      ).forEach(([field, [message]]) => {
        setError(field, { message, type: 'custom' });
      });
    } else {
      await getActivities(userId);
    }

    onSubmit();
  };

  const selectedColorPicker = color.length === 6 ? color : '';

  return (
    <div className="w-2/3 min-w-64 mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="[&>div]:mb-4 flex flex-col">
          <FormFieldInput name="name" label="Name" />

          <FormFieldInput
            name="color"
            label="Color"
            maxLength={6}
            allowedSymbols={/^[a-fA-F0-9]*$/}
            inputComponent={InputIcon}
            inputProps={{
              icon: (
                <Palette
                  size="16"
                  weight="fill"
                  style={{
                    color: color.length === 6 ? color : '000000',
                  }}
                />
              ),
            }}
          />
          <HexColorPicker color={selectedColorPicker} onChange={handleColorChange} className="hexColorPicker" />

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
