'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Credentials } from '@/lib/definitions';
import { SignInSchema } from '@/lib/validation';
import { useAction } from '@/ui/hooks/use-action';
import { authenticate, googleAuthenticate } from '@/lib/actions/auth/sign-in';
import { Button, buttonVariants } from '@/ui/common/button';
import { Form, FormFieldInput, FormMessage } from '@/ui/common/form';
import { InputPassword } from '@/ui/common/form/input-password';
import { Logo } from "@/ui/common/logo";
import { TextSeparator } from '@/ui/common/separator';
import { GoogleSignIn } from './google-sign-in';
import { LoadingOverlay } from '@/ui/common/loading-overlay';
import { cn } from '@/lib/utils';
import { matchFieldErrors } from '@/ui/utils';

export function SignInForm() {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [errorMsgGoogle, dispatchGoogle] = useFormState(
    googleAuthenticate,
    undefined,
  );
  const {
    action: auth,
    isLoading,
  } = useAction(authenticate);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof SignInSchema>) => {
    setLoginError(null);

    const result = await auth(values);

    if (result?.message) setLoginError(result.message);
    if (result?.errors) {
      matchFieldErrors<Credentials>(result.errors, form.setError);
    }
  };

  const hasErrors = loginError || errorMsgGoogle;

  return (
    <div className="w-80 p-6 rounded-md bg-white text-secondary relative">
      <LoadingOverlay show={isLoading} className="rounded-md" />

      <div className="h-14 flex justify-center mb-2">
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
        <GoogleSignIn />
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
