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
import { createActivity } from '@/lib/actions/activity';
import { getRandomValue } from '@/lib/utils';
import './hex-color-picker.css';

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
}: {
  onSubmit: () => void;
}) {
  const form = useForm<z.infer<typeof ActivitySchema>>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      name: '',
      color: '',
      icon: 'airplay',
    },
  });

  const color = useWatch({ name: 'color', control: form.control });
  const icon = useWatch({ name: 'icon', control: form.control });

  const handleColorChange = useCallback((value: string) => {
    form.setValue('color', value.slice(1));
    void form.trigger('color');
  }, [form]);

  useEffect(() => {
    handleColorChange(getRandomValue(BASIC_COLORS));
  }, [handleColorChange]);

  const handleIconChange = (iconName: string) => {
    form.setValue('icon', iconName);
  }

  const handleSubmit = (values: z.infer<typeof ActivitySchema>) => {
    createActivity(values).then((value) => {
      if (!value) return;
      if (typeof value === 'object' && 'errors' in value) {
        (
          Object.entries(value.errors!) as [keyof Pick<ActivityForm, 'name' | 'color' | 'icon'>, string[]][]
        ).forEach(([field, [message]]) => {
          form.setError(field, {message, type: 'custom'});
        });

        return onSubmit();
      }
    })
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

          <div className="h-28">
            <IconPicker
              selected={icon}
              onSelect={handleIconChange}
            />
          </div>

          <Button type="submit" className="mt-auto w-full">
            Create Activity
          </Button>
        </form>
      </Form>
    </div>
  );
}
