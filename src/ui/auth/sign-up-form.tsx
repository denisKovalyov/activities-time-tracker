'use client';

import { useState, useActionState, useTransition } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Credentials } from '@/lib/definitions';
import { SignUpSchema } from '@/lib/validation';
import { googleAuthenticate } from '@/lib/actions/auth/sign-in';
import { signUp } from '@/lib/actions/auth/sign-up';
import { Button, buttonVariants } from '@/ui/common/button';
import { Form, FormFieldInput, FormMessage } from '@/ui/common/form';
import { TextSeparator } from '@/ui/common/separator';
import { Logo } from '@/ui/common/logo';
import { PasswordField } from './password-field';
import { GoogleSignInButton } from './google-sign-in-button';
import { LoadingOverlay } from '@/ui/common/loading-overlay';
import { SyncTimeZoneCookie } from './sync-time-zone-cookie';
import { cn } from '@/lib/utils/common';
import { matchFieldErrors } from '@/lib/utils/ui';

export function SignUpForm() {
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [errorMsgGoogle, dispatchGoogle] = useActionState(
    googleAuthenticate,
    undefined,
  );
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof SignUpSchema>) => {
    setSignUpError(null);

    startTransition(async () => {
      const result = await signUp(values);

      if (result?.message) setSignUpError(result.message);
      if (result?.errors)
        matchFieldErrors<Credentials>(result.errors, form.setError);
    });
  };

  const hasErrors = signUpError || errorMsgGoogle;

  return (
    <div className="relative w-80 rounded-md bg-white p-6 text-secondary">
      <SyncTimeZoneCookie />
      <LoadingOverlay show={isPending} className="rounded-md" />

      <div className="mb-2 flex h-14 justify-center">
        <Logo />
      </div>

      <h2 className="prose-xl mb-4 text-center text-primary">Sign Up</h2>

      <Form {...form}>
        {hasErrors && (
          <div className="mb-4 [&>div]:mb-2">
            {signUpError && <FormMessage>{signUpError}</FormMessage>}
            {errorMsgGoogle && <FormMessage>{errorMsgGoogle}</FormMessage>}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="[&>div]:mb-4">
          <FormFieldInput name="email" label="Email" />
          <PasswordField />

          <Button type="submit" className="mt-2 w-full">
            Sign Up
          </Button>
        </form>
      </Form>

      <TextSeparator className="my-3" text="or" />

      <form action={dispatchGoogle}>
        <GoogleSignInButton />
      </form>

      <div className="my-3 text-center text-sm">
        {`By proceeding, you acknowledge and accept our `}
        <Link
          className={cn(
            buttonVariants({
              variant: 'link',
              className: 'inline h-auto px-0 py-0',
            }),
          )}
          target="_blank"
          href="/privacy-policy"
        >
          Privacy Policy
        </Link>
        .
      </div>

      <div className="flex items-center justify-center">
        <span className="mr-2 text-sm">Already have an account?</span>
        <Link
          className={cn(
            buttonVariants({
              variant: 'link',
              className: 'h-auto px-0 py-0',
            }),
          )}
          href="/sign-in"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
