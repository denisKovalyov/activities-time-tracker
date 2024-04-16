'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormMessage } from '@/ui/common/form';
import { PasswordField } from '@/ui/auth/password-field';
import { Button } from '@/ui/common/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveNewPasswordSchema } from '@/lib/validation';
import {
  authenticate,
  checkResetPasswordLink,
  saveNewPassword,
} from '@/lib/actions/auth';

const TITLE = 'Save New Password';
const TEXT = 'Please enter your new password below.';

export function PasswordSaveForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const form = useForm<z.infer<typeof SaveNewPasswordSchema>>({
    resolver: zodResolver(SaveNewPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  useEffect(() => {
    checkResetPasswordLink(email, token).then((value) => {
      if (value?.message) setError(value.message);
      if (value?.message || value.success) setIsLoading(false);
    });
  }, [email, token]);

  const onSubmit = async (values: z.infer<typeof SaveNewPasswordSchema>) => {
    setError(null);

    const result = await saveNewPassword(email as string, values.password);

    if (result?.message && !result?.success) {
      setError(result.message);
      return;
    }

    const loginResult = await authenticate({
      email: email as string,
      password: values.password,
    });

    if (loginResult?.message) {
      setError('Something went wrong');
    }
  };

  if (isLoading) return null;

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
          <PasswordField />
          <Button type="submit" className="mt-2 w-full">
            Save password
          </Button>
        </form>
      </Form>
    </div>
  );
}
