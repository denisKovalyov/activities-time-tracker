'use client';

import { Button } from '@/ui/common/button';
import { Form, FormFieldInput } from '@/ui/common/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ResetPasswordSchema } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';

const TITLE = 'Reset your password';
const SUB_TITLE =
  "Please enter email used for registration and we'll send you link to reset password.";

export function ResetPasswordForm() {
  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    console.log('values', values);
  };

  return (
    <div className="w-80 rounded-md bg-white p-6">
      <div className="prose-lg mb-4 text-center">{TITLE}</div>
      <div className="prose-sm mb-4">{SUB_TITLE}</div>

      <Form {...form}>
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
