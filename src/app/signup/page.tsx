import AuthForm from '@/src/components/auth/auth-form';
import ThemeToggle from '@/src/components/theme-toggle';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <Link href="/" className="text-xl font-bold">AI Notes App</Link>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </main>
    </div>
  );
}