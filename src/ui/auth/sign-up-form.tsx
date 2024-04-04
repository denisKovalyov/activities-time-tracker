'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Credentials } from '@/lib/definitions';
import { SignUpSchema, validatePassword } from '@/lib/validation';
import { authenticate, googleAuthenticate } from '@/lib/actions';
import { Button, buttonVariants } from '@/ui/common/button';
import { Form, FormFieldInput, FormMessage } from '@/ui/common/form';
import { PasswordTooltipContent } from '@/ui/auth/password-tooltip'
import { TextSeparator } from '@/ui/common/separator';
import { cn } from '@/lib/utils';
import { GoogleSignIn } from './google-sign-in';

export function SignUpForm() {
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [errorMsgGoogle, dispatchGoogle] = useFormState(
    googleAuthenticate,
    undefined,
  );
  const [showTooltip, setShowTooltip] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<ReactNode>(null);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const password = useWatch({ control: form.control, name: 'password' });
  const passwordFieldError = form.formState.errors.password;

  useEffect(() => {
    const errors = validatePassword(password) || [];

    setPasswordRequirements(
      <PasswordTooltipContent
        requirements={errors}
        error={Boolean(passwordFieldError)}
      />
    );
  }, [password, passwordFieldError]);

  const onSubmit = (values: z.infer<typeof SignUpSchema>) => {
    setSignUpError(null);

    // authenticate(values).then((value) => {
    //   if (!value) return;
    //   if (value.message) setSignUpError(value.message);
    //   if (value.errors) {
    //     (
    //       Object.entries(value.errors) as [keyof Credentials, string[]][]
    //     ).forEach(([field, [message]]) => {
    //       form.setError(field, { message, type: 'custom' });
    //     });
    //   }
    // });
  };

  const handlePasswordFocus = () => setShowTooltip(true);
  const handlePasswordBlur = () => setShowTooltip(false);

  const hasErrors = signUpError || errorMsgGoogle;

  return (
    <div className="min-w-80 max-w-96 rounded-md bg-white p-6">
      <h2 className="prose-xl mb-4 text-center">Sign Up</h2>

      <Form {...form}>
        {hasErrors && (
          <div className="mb-4 [&>div]:mb-2">
            {signUpError && <FormMessage>{signUpError}</FormMessage>}
            {errorMsgGoogle && <FormMessage>{errorMsgGoogle}</FormMessage>}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="[&>div]:mb-4">
          <FormFieldInput name="email" label="Email"/>
          <FormFieldInput
            name="password"
            label="Password"
            inputType="password"
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            showTooltip={showTooltip}
            tooltipContent={passwordRequirements}
          />

          <Button type="submit" className="mt-2 w-full">
            Sign Up
          </Button>
        </form>
      </Form>

      <TextSeparator className="my-3" text="or"/>

      <form action={dispatchGoogle}>
        <GoogleSignIn/>
      </form>

      <div className="mt-4 flex items-center justify-center">
        <span className="mr-2 text-sm">Already an have account?</span>
        <Link
          className={cn(buttonVariants({
            variant: 'link',
            className: 'h-auto px-0 py-0',
          }))}
          href="/sign-in"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
