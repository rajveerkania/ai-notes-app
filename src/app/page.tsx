'use client';

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import ThemeToggle from '@/src/components/theme-toggle';
import { Pencil, FileText, Sparkles } from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <h1 className="text-xl font-bold">AI Notes App</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <form action="/auth/signout" method="post">
                  <Button type="submit">Sign Out</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Smart Note-Taking with AI
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create, organize, and summarize your notes with the power of AI.
            Never lose track of important information again.
          </p>

          {session ? (
            <div className="flex justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg">Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
            </div>
          )}

          <div className="mt-16 p-6 border border-border rounded-lg bg-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Feature icon={<Pencil />} title="Create Notes" description="Quickly capture your thoughts and ideas in one place." />
              <Feature icon={<FileText />} title="Organize" description="Keep your notes structured and easily accessible." />
              <Feature icon={<Sparkles />} title="AI Summarization" description="Let AI create concise summaries of your lengthy notes." />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Notes App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-center text-muted-foreground">{description}</p>
    </div>
  );
}
