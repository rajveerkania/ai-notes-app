'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import EditNotePage from '@/src/components/EditNotePage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const resolvedParams = use(params);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <EditNotePage params={resolvedParams} />;
}