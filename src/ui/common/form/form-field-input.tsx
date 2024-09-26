'use client';

import { FC, HTMLInputTypeAttribute, ReactNode } from 'react';
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
import { TooltipWrapper } from '@/ui/common/tooltip';
import * as React from 'react';

export interface FormFieldInputProps extends InputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  description?: ReactNode;
  showTooltip?: boolean;
  inputComponent?: FC<React.InputHTMLAttributes<HTMLInputElement>>;
  tooltipContent?: ReactNode;
  allowedSymbols?: RegExp;
}

export const FormFieldInput = ({
  name,
  label,
  placeholder = '',
  type = 'text',
  description,
  showTooltip = false,
  inputComponent = Input,
  tooltipContent,
  allowedSymbols,
  ...props
}: FormFieldInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const InputComponent = inputComponent;
  const hasError = name in errors;

  const renderInput = (field: ControllerRenderProps) => {
    const input = (
      <InputComponent
        className={clsx({
          'border-destructive [&+button>svg]:text-destructive': hasError,
        })}
        placeholder={placeholder}
        type={type}
        onKeyDown={allowedSymbols ? (e) => {
          if (e.key.length > 1 || e.metaKey) return;
          if (!allowedSymbols.test(e.key)) e.preventDefault();
        } : undefined}
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
