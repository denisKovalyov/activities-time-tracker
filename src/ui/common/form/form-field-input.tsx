'use client';

import { HTMLInputTypeAttribute, ReactNode } from 'react';
import { clsx } from 'clsx';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/ui/common/form/form';
import { Input, InputProps } from '@/ui/common/form/input';
import { InputPassword } from '@/ui/common/form/input-password';
import { TooltipWrapper } from '@/ui/common/tooltip';

interface FormFieldInputProps extends InputProps {
  name: string;
  label: string;
  inputType?: HTMLInputTypeAttribute;
  placeholder?: string;
  description?: ReactNode;
  showTooltip?: boolean;
  tooltipContent?: ReactNode;
}

export const FormFieldInput = ({
  name,
  label,
  placeholder = '',
  inputType = 'text',
  description,
  showTooltip = false,
  tooltipContent,
  ...props
}: FormFieldInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const InputComponent = inputType === 'password' ? InputPassword : Input;
  const hasError = name in errors;

  const renderInput = (field: ControllerRenderProps) => {
    const input = (
      <InputComponent
        className={clsx({
          'border-destructive [&+button>svg]:text-destructive': hasError,
        })}
        placeholder={placeholder}
        type={inputType}
        {...field}
        {...props}
      />
    );

    return tooltipContent ? (
      <TooltipWrapper
        show={showTooltip}
        trigger={input}
        content={tooltipContent}
        offset={12}
      />
    ) : (
      input
    );
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-primary">{label}</FormLabel>
          <FormControl>{renderInput(field)}</FormControl>
          <FormMessage />
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  );
};
