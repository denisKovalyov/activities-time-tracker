'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Credentials } from '@/lib/definitions';
import { LoginSchema } from '@/lib/validation';
import { authenticate, googleAuthenticate } from '@/lib/actions';
import { Button, buttonVariants } from '@/ui/common/button';
import { Form, FormFieldInput, FormMessage } from '@/ui/common/form';
import { TextSeparator } from '@/ui/common/separator';
import { cn } from '@/lib/utils';
import { GoogleSignIn } from './google-sign-in';

export function SignInForm() {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [errorMsgGoogle, dispatchGoogle] = useFormState(
    googleAuthenticate,
    undefined,
  );

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setLoginError(null);

    authenticate(values).then((value) => {
      if (!value) return;
      if (value.message) setLoginError(value.message);
      if (value.errors) {
        (
          Object.entries(value.errors) as [keyof Credentials, string[]][]
        ).forEach(([field, [message]]) => {
          form.setError(field, { message, type: 'custom' });
        });
      }
    });
  };

  const hasErrors = loginError || errorMsgGoogle;

  return (
    <div className="min-w-80 max-w-96 rounded-md bg-white p-6">
      <h2 className="prose-xl mb-4 text-center">Sign In</h2>

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
            inputType="password"
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
