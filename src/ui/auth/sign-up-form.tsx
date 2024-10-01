'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAction } from '@/ui/hooks/use-action';
import { Credentials } from '@/lib/definitions';
import { SignUpSchema } from '@/lib/validation';
import { googleAuthenticate } from '@/lib/actions/auth/sign-in';
import { signUp as signUpAction } from '@/lib/actions/auth/sign-up';
import { Button, buttonVariants } from '@/ui/common/button';
import { Form, FormFieldInput, FormMessage } from '@/ui/common/form';
import { TextSeparator } from '@/ui/common/separator';
import { Logo } from '@/ui/common/logo';
import { PasswordField } from './password-field';
import { GoogleSignIn } from './google-sign-in';
import { LoadingOverlay } from '@/ui/common/loading-overlay';
import { cn } from '@/lib/utils';
import { matchFieldErrors } from '@/ui/utils';

export function SignUpForm() {
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [errorMsgGoogle, dispatchGoogle] = useFormState(
    googleAuthenticate,
    undefined,
  );
  const {
    action: signUp,
    isLoading,
  } = useAction(signUpAction);


  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof SignUpSchema>) => {
    setSignUpError(null);

    const result = await signUp(values);

    if (result?.message) setSignUpError(result.message);
    if (result?.errors) matchFieldErrors<Credentials>(result.errors, form.setError);
  };

  const hasErrors = signUpError || errorMsgGoogle;

  return (
    <div className="w-80 p-6 rounded-md bg-white text-secondary relative">
      <LoadingOverlay show={isLoading} className="rounded-md" />

      <div className="h-14 flex justify-center mb-2">
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

      <TextSeparator className="my-3" text="or"/>

      <form action={dispatchGoogle}>
        <GoogleSignIn />
      </form>

      <div className="mt-4 flex items-center justify-center">
        <span className="mr-2 text-sm">Already an have account?</span>
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
