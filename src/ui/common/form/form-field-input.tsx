import React, { HTMLInputTypeAttribute } from 'react';
import { clsx } from 'clsx';
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
import { InputPassword } from '@/ui/common/form/input-password';

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
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const InputComponent = inputType === 'password' ? InputPassword : Input;
  const hasError = name in errors;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <InputComponent
              className={clsx({
                'border-destructive [&+button>svg]:text-destructive': hasError,
              })}
              placeholder={placeholder}
              type={inputType}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
