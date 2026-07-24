'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Volume2, Loader2, Sparkles, Download } from 'lucide-react';
import { smartSearchAssistant } from '@/ai/flows/smart-search-assistant';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUsageLimit } from '@/hooks/use-usage-limit';

const formSchema = z.object({
  prompt: z.string().min(5, 'Please provide a clearer question (at least 5 characters).'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SmartAssistant() {
  const { toast } = useToast();
  const { isLimitReached, incrementUsage } = useUsageLimit();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; audioDataUri: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '' },
  });

  const handleResearch: SubmitHandler<FormValues> = async (data) => {
    if (isLimitReached) {
      toast({
        variant: 'destructive',
        title: 'Limit Reached',
        description: 'You have reached your daily request limit.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const response = await smartSearchAssistant({ prompt: data.prompt });
      setResult(response);
      incrementUsage();
    } catch (error) {
      console.error('Research failed:', error);
      toast({
        variant: 'destructive',
        title: 'Research failed',
        description: 'There was a problem searching or generating audio. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Smart Audio Assistant</h1>
        <p className="text-muted-foreground mt-2">Enter a topic, I'll research the web and speak the answer.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleResearch)} className="space-y-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Topic or Question</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'What is the current status of the Artemis moon mission?'"
                    className="min-h-[100px] bg-secondary/20 border-primary/10 focus-visible:ring-primary text-base"
                    {...field}
                    disabled={isLimitReached}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full font-bold" disabled={isLoading || isLimitReached}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Researching & Synthesizing...</>
            ) : (
              <><Search className="mr-2 h-5 w-5" /> Research & Speak</>
            )}
          </Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6 bg-secondary/30 p-6 rounded-xl border-2 border-primary/5 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Sparkles className="h-5 w-5" />
            <span>Assistant's Answer</span>
          </div>
          <p className="text-foreground leading-relaxed text-lg italic">"{result.answer}"</p>
          <div className="pt-4 border-t border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Volume2 className="h-4 w-4" />
                <span>Audio Response</span>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-8 gap-2 text-xs">
                <a href={result.audioDataUri} download="eva-assistant-response.wav">
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </Button>
            </div>
            <audio controls src={result.audioDataUri} className="w-full h-10 shadow-inner rounded-md" autoPlay>
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
}
