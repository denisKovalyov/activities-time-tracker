import Image from 'next/image';
import { LoginForm } from '@/ui/auth/login-form';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </main>
  );
}
