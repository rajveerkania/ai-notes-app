import { ReactNode } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/src/components/theme-toggle';
import { LogOut, FileText, Plus } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <Link href="/dashboard" className="text-xl font-bold">AI Notes App</Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex items-center gap-1 text-sm">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 border-r border-border p-4 hidden md:block">
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <FileText className="h-4 w-4" />
              All Notes
            </Link>
            <Link
              href="/dashboard/new"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Note
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}