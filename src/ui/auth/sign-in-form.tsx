'use client';

import { useState, useActionState, useTransition } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Credentials } from '@/lib/definitions';
import { SignInSchema } from '@/lib/validation';
import { authenticate, googleAuthenticate } from '@/lib/actions/auth/sign-in';
import { Button, buttonVariants } from '@/ui/common/button';
import { Form, FormFieldInput, FormMessage } from '@/ui/common/form';
import { InputPassword } from '@/ui/common/form/input-password';
import { Logo } from '@/ui/common/logo';
import { TextSeparator } from '@/ui/common/separator';
import { GoogleSignInButton } from './google-sign-in-button';
import { LoadingOverlay } from '@/ui/common/loading-overlay';
import { SyncTimeZoneCookie } from './sync-time-zone-cookie';
import { cn } from '@/lib/utils/common';
import { matchFieldErrors } from '@/lib/utils/ui';

export function SignInForm() {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [errorMsgGoogle, dispatchGoogle] = useActionState(
    googleAuthenticate,
    undefined,
  );
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof SignInSchema>) => {
    setLoginError(null);

    startTransition(async () => {
      const result = await authenticate(values);

      if (result?.message) setLoginError(result.message);
      if (result?.errors) {
        matchFieldErrors<Credentials>(result.errors, form.setError);
      }
    });
  };

  const hasErrors = loginError || errorMsgGoogle;

  return (
    <div className="relative w-80 rounded-md bg-white p-6 text-secondary">
      <SyncTimeZoneCookie />
      <LoadingOverlay show={isPending} className="rounded-md" />

      <div className="mb-2 flex h-14 justify-center">
        <Logo />
      </div>

      <h2 className="prose-xl mb-4 text-center text-primary">Sign In</h2>

      <Form {...form}>
        {hasErrors && (
          <div className="mb-4 [&>div]:mb-2">
            {loginError && <FormMessage>{loginError}</FormMessage>}
            {errorMsgGoogle && <FormMessage>{errorMsgGoogle}</FormMessage>}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="[&>div]:mb-4">
          <FormFieldInput name="email" label="Email" />
          <FormFieldInput
            name="password"
            label="Password"
            inputComponent={InputPassword}
            autoComplete="current-password"
            description={
              <Link
                className={cn(
                  buttonVariants({
                    variant: 'link',
                    className: 'h-auto px-0 py-0',
                    size: 'sm',
                  }),
                )}
                href="/reset-password/request"
              >
                Forgot password?
              </Link>
            }
          />
          <Button type="submit" className="mt-2 w-full">
            Sign In
          </Button>
        </form>
      </Form>

      <TextSeparator className="my-3" text="or" />

      <form action={dispatchGoogle}>
        <GoogleSignInButton />
      </form>

      <div className="mt-4 flex items-center justify-center">
        <span className="mr-2 text-sm">Don&apos;t have an account yet?</span>
        <Link
          className={cn(
            buttonVariants({
              variant: 'link',
              className: 'h-auto px-0 py-0',
            }),
          )}
          href="/sign-up"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
