'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Toaster } from '@/src/components/ui/sonner';

export default function NewNotePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const createNoteMutation = useMutation({
    mutationFn: async ({ title, content, summary = null }: {
      title: string;
      content: string;
      summary?: string | null;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('notes')
        .insert({
          title,
          content,
          summary,
          user_id: userData.user.id
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.push('/dashboard');
    }
  });

  const summarizeNoteMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to summarize');

      const data = await response.json();
      return data.summary;
    }
  });

  const handleSummarize = async () => {
    if (!content || content.trim().length < 50) {
      toast.warning('Please add more content to summarize (at least 50 characters)');
      return;
    }

    try {
      setIsSummarizing(true);
      const summary = await summarizeNoteMutation.mutateAsync(content);
      await createNoteMutation.mutateAsync({ title, content, summary });
    } catch (error) {
      console.error('Error summarizing:', error);
      toast.error('Error generating summary. Creating note without summary.');
      await createNoteMutation.mutateAsync({ title, content });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast.warning('Please add both title and content');
      return;
    }

    try {
      await createNoteMutation.mutateAsync({ title, content }).then(() => {
        toast.success('Noted!');
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Error creating note');
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/login');
      }
    });
  }, [router]);


  return (
    <Card className="max-w-3xl mx-auto">
      <Toaster />
      <CardHeader>
        <CardTitle>Create New Note</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            className="min-h-[200px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleSummarize}
            disabled={createNoteMutation.isPending || summarizeNoteMutation.isPending || isSummarizing}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Save with AI Summary
          </Button>
          <Button
            onClick={handleSave}
            disabled={createNoteMutation.isPending}
          >
            Save Note
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}


