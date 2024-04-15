'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/ui/common/button';
import { Form, FormFieldInput, FormMessage } from '@/ui/common/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ResetPasswordSchema } from '@/lib/validation';
import { sendResetPasswordLink } from '@/lib/actions/auth';
import { zodResolver } from '@hookform/resolvers/zod';

const TITLE = 'Reset your password';
const TEXT =
  'Please enter email used for registration and we will send you link to set new password.';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [error, setError] = useState<string | null>();

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: email || '',
    },
  });

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    setError(null);

    sendResetPasswordLink(values.email).then((value) => {
      if (value?.message) setError(value.message);
    });
  };

  return (
    <div className="w-80 rounded-md bg-white p-6">
      <div className="prose-lg mb-4 text-center">{TITLE}</div>
      <div className="prose-sm mb-4">{TEXT}</div>

      <Form {...form}>
        {error && (
          <div className="mb-4 [&>div]:mb-2">
            <FormMessage>{error}</FormMessage>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="[&>div]:mb-4">
          <FormFieldInput name="email" label="Email" />

          <Button type="submit" className="mt-2 w-full">
            Send email
          </Button>
        </form>
      </Form>
    </div>
  );
}
