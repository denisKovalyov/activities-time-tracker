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
import { authenticate } from '@/lib/actions/auth/sign-in';
import {
  checkResetPasswordLink,
  saveNewPassword,
} from '@/lib/actions/auth/reset-password';
import { LoadingOverlay } from '@/ui/common/loading-overlay';
import { Skeleton } from '@/ui/common/skeleton';

const TITLE = 'Save New Password';
const TEXT = 'Please enter your new password below.';

export function PasswordSaveForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsPageLoading(false);
    });
  }, [email, token]);

  const onSubmit = async (values: z.infer<typeof SaveNewPasswordSchema>) => {
    setError(null);
    setIsLoading(true);

    const result = await saveNewPassword(email as string, values.password);

    if (result?.message) {
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

  if (isPageLoading) {
    return <Skeleton className="h-72 w-80 rounded-md" />;
  }

  return (
    <div className="relative w-80 rounded-md bg-white p-6 text-secondary">
      <LoadingOverlay show={isLoading} className="rounded-md" />

      <div className="prose-lg mb-4 text-center text-primary">{TITLE}</div>
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
