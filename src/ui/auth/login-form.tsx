'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Credentials } from '@/lib/definitions';
import { LoginSchema } from '@/lib/validationSchemas';
import { authenticate, googleAuthenticate } from '@/lib/actions';
import { Button } from '@/ui/common/button';
import { Form, FormFieldInput, FormMessage } from '@/ui/common/form';
import { GoogleSignIn } from './google-sign-in';

export function LoginForm() {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [errorMsgGoogle, dispatchGoogle] = useFormState(googleAuthenticate, undefined);

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

  return (
    <div className="space-y-8">
      <Form {...form}>
        {loginError && <FormMessage>{loginError}</FormMessage>}
        {errorMsgGoogle && <FormMessage>{errorMsgGoogle}</FormMessage>}

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="min-w-80 max-w-96 space-y-8"
        >
          <FormFieldInput name="email" label="Email"/>
          <FormFieldInput name="password" label="Password" inputType="password"/>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <form action={dispatchGoogle}>
        <GoogleSignIn />
      </form>
    </div>
  );
}
