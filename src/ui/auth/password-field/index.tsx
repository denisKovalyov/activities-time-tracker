'use client';

import { ReactNode, useEffect, useState } from 'react';
import { FormFieldInput } from '@/ui/common/form';
import { useFormContext, useWatch } from 'react-hook-form';
import { PasswordTooltipContent } from '@/ui/auth/password-field/password-tooltip';
import { InputPassword } from '@/ui/common/form/input-password';
import { validatePassword } from '@/lib/validation';

export function PasswordField() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [passwordRequirements, setPasswordRequirements] =
    useState<ReactNode>(null);

  const {
    control,
    formState: { errors },
  } = useFormContext();

  const password = useWatch({ control: control, name: 'password' });
  const passwordFieldError = errors.password;

  useEffect(() => {
    const errors = validatePassword(password) || [];

    setPasswordRequirements(
      <PasswordTooltipContent
        requirements={errors}
        markAsError={Boolean(passwordFieldError)}
      />,
    );
  }, [password, passwordFieldError]);

  const handlePasswordFocus = () => setShowTooltip(true);
  const handlePasswordBlur = () => setShowTooltip(false);

  return (
    <FormFieldInput
      name="password"
      label="Password"
      inputComponent={InputPassword}
      onFocus={handlePasswordFocus}
      onBlur={handlePasswordBlur}
      showTooltip={showTooltip}
      tooltipContent={passwordRequirements}
    />
  );
}
