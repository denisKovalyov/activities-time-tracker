'use client';

import { useState } from 'react';
import { FormFieldInput } from '@/ui/common/form';
import { useFormContext, useWatch } from 'react-hook-form';
import { PasswordTooltip } from './password-tooltip';
import { InputPassword } from '@/ui/common/form/input-password';
import { validatePassword } from '@/lib/validation';

export function PasswordField() {
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    control,
    formState: { errors },
  } = useFormContext();

  const password = useWatch({ control, name: 'password' });

  const passwordRequirements = (
    <PasswordTooltip
      requirements={validatePassword(password) || []}
      markAsError={Boolean(errors.password)}
    />
  );

  const handlePasswordFocus = () => setShowTooltip(true);
  const handlePasswordBlur = () => setShowTooltip(false);

  return (
    <FormFieldInput
      name="password"
      label="Password"
      inputComponent={InputPassword}
      autoComplete="new-password"
      onFocus={handlePasswordFocus}
      onBlur={handlePasswordBlur}
      showTooltip={showTooltip}
      tooltipContent={passwordRequirements}
    />
  );
}
