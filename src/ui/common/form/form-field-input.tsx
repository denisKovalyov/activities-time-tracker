import React, { HTMLInputTypeAttribute } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/ui/common/form/form';
import { Input } from '@/ui/common/form/input';

export const FormFieldInput = ({
  name,
  label,
  placeholder = '',
  inputType = 'text',
  description,
}: {
  name: string;
  label: string;
  inputType?: HTMLInputTypeAttribute;
  placeholder?: string;
  description?: string;
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} type={inputType} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
