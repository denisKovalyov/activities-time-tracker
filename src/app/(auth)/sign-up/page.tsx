import Image from 'next/image';
import { SignUpForm } from '@/ui/auth/sign-up-form';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUpForm />
    </main>
  );
}
