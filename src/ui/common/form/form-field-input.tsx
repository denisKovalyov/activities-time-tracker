'use client';

import { FC, HTMLInputTypeAttribute, ReactNode, ElementType } from 'react';
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

export interface FormFieldInputProps extends InputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  description?: ReactNode;
  showTooltip?: boolean;
  inputComponent?: ElementType | FC<InputProps>;
  renderCustomInput?: (className: string) => ReactNode;
  inputProps?: {[key: string]: unknown};
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
  inputComponent: InputComponent = Input,
  renderCustomInput,
  tooltipContent,
  allowedSymbols,
  inputProps = {},
  ...props
}: FormFieldInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const hasError = name in errors;

  const inputClassName = clsx({
    'border-destructive [&+button>svg]:text-destructive': hasError,
  });

  const renderInput = (field: ControllerRenderProps) => {
    const input = renderCustomInput
      ? renderCustomInput(inputClassName)
      : (
        <InputComponent
          className={inputClassName}
          placeholder={placeholder}
          type={type}
          onKeyDown={allowedSymbols ? (e: KeyboardEvent) => {
            if (e.key.length > 1 || e.metaKey) return;
            if (!allowedSymbols.test(e.key)) e.preventDefault();
          } : undefined}
          {...field}
          {...props}
          {...inputProps}
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

export const FormFieldCustomInput = ({
  name,
  label,
  placeholder = '',
  type = 'text',
  description,
  showTooltip = false,
  inputComponent: InputComponent = Input,
  tooltipContent,
  allowedSymbols,
  inputProps = {},
  ...props
}: FormFieldInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const hasError = name in errors;

  const renderInput = (field: ControllerRenderProps) => {
    const input = (
      <InputComponent
        className={clsx({
          'border-destructive text-destructive [&+button>svg]:text-destructive': hasError,
        })}
        placeholder={placeholder}
        type={type}
        onKeyDown={allowedSymbols ? (e: KeyboardEvent) => {
          if (e.key.length > 1 || e.metaKey) return;
          if (!allowedSymbols.test(e.key)) e.preventDefault();
        } : undefined}
        {...field}
        {...props}
        {...inputProps}
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

