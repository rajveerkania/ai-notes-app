'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog';

type Note = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: notes,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notes', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    }
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/login');
      } else {
        setUserId(data.user.id);
      }
    });
  }, [router]);

  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

  function openDeleteDialog(id: string) {
    setNoteToDelete(id);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeleteNote() {
    if (!noteToDelete) return;

    await supabase.from('notes').delete().eq('id', noteToDelete);
    refetch();
    setIsDeleteDialogOpen(false);
    setNoteToDelete(null);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <Button onClick={() => router.push('/dashboard/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading notes...</div>
      ) : error ? (
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">Error loading notes</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : notes?.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium mb-2">No notes yet</h3>
          <p className="text-muted-foreground mb-4">Create your first note to get started</p>
          <Button onClick={() => router.push('/dashboard/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(notes ?? []).map((note) => (
            <Card key={note.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                <CardDescription>
                  Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-1">
                <p className="text-sm line-clamp-3">{note.summary || note.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => openDeleteDialog(note.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/edit/${note.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}