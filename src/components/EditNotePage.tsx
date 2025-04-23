import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Toaster } from '@/src/components/ui/sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

interface EditNotePageProps {
  params: {
    id: string;
  };
}

export default function EditNotePage({ params }: EditNotePageProps) {
  const router = useRouter();
  const noteId = params.id;
  const queryClient = useQueryClient();


  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: note, isLoading, isError } = useQuery<Note, Error>({
    queryKey: ['note', noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) throw new Error(error.message);
      return data as Note;
    }
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSummary(note.summary);
    }
  }, [note]);

  const updateNoteMutation = useMutation({
    mutationFn: async ({ title, content, summary }: { title: string; content: string; summary?: string | null }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          summary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      toast.success('Summary Updated');
    },
    onError: (error: Error) => {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  });

  const summarizeNoteMutation = useMutation<
    { summary: string },
    Error,
    string
  >({
    mutationFn: async (text: string) => {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to summarize');
      }

      return await response.json();
    },
    onError: (error: Error) => {
      console.error('Summarization error:', error);
      toast.error(error.message || 'Error generating summary');
    }
  });

  const handleSummarize = async () => {
    if (!content || content.trim().length < 50) {
      toast.warning('Please add more content to summarize (at least 50 characters)');
      return;
    }

    try {
      const { summary: newSummary } = await summarizeNoteMutation.mutateAsync(content);
      setSummary(newSummary);
      await updateNoteMutation.mutateAsync({
        title,
        content,
        summary: newSummary
      });
    } catch (error) {
      toast.error("Failed to resummarize")
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast.warning('Please add both title and content');
      return;
    }

    await updateNoteMutation.mutateAsync({ title, content, summary });
    router.push('/dashboard');
  };

  if (!isClient || isLoading) {
    return <div className="flex justify-center items-center h-64">Loading note...</div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center h-64">Error loading note</div>;
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <Toaster />
      <CardHeader>
        <CardTitle>Edit Note</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            disabled={updateNoteMutation.isPending}
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
            disabled={updateNoteMutation.isPending}
          />
        </div>
        {summary && (
          <div className="p-4 bg-secondary/50 rounded-md">
            <Label className="block mb-2">AI Summary</Label>
            <p className="text-sm">{summary}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={updateNoteMutation.isPending}
        >
          Cancel
        </Button>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              handleSummarize();
            }}
            disabled={
              updateNoteMutation.isPending ||
              summarizeNoteMutation.isPending ||
              !content.trim()
            }
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {summarizeNoteMutation.isPending ? 'Summarizing...' : summary ? 'Re-summarize' : 'Generate Summary'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateNoteMutation.isPending}
          >
            {updateNoteMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}