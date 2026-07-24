'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wand2, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { enhancePrompt } from '@/ai/flows/enhance-prompt';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUsageLimit } from '@/hooks/use-usage-limit';

const formSchema = z.object({
  prompt: z.string().min(5, 'Enter at least 5 characters to enhance.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PromptEnhancer() {
  const { toast } = useToast();
  const { isLimitReached, incrementUsage } = useUsageLimit();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '' },
  });

  const handleEnhance: SubmitHandler<FormValues> = async (data) => {
    if (isLimitReached) {
      toast({
        variant: 'destructive',
        title: 'Limit Reached',
        description: 'You have reached your daily request limit.',
      });
      return;
    }

    setIsLoading(true);
    setEnhancedText('');
    try {
      const response = await enhancePrompt({ prompt: data.prompt });
      setEnhancedText(response.enhancedPrompt);
      incrementUsage();
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast({
        variant: 'destructive',
        title: 'Enhancement failed',
        description: 'There was a problem processing your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!enhancedText) return;
    navigator.clipboard.writeText(enhancedText);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Enhanced prompt copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!mounted) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Prompt Generator</h1>
        <p className="text-muted-foreground mt-2">Enter a basic idea, and I'll generate a professional, high-quality AI prompt.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleEnhance)} className="space-y-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Simple Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'Write a story about a cat' or 'Generate a logo for a tech company'"
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
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enhancing...</>
            ) : (
              <><Wand2 className="mr-2 h-5 w-5" /> Enhance Prompt</>
            )}
          </Button>
        </form>
      </Form>

      {enhancedText && (
        <div className="space-y-4 bg-secondary/30 p-6 rounded-xl border-2 border-primary/10 shadow-sm group">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Sparkles className="h-5 w-5" />
              <span>Enhanced Version</span>
            </div>
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 px-2 hover:bg-primary/10">
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="relative">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap bg-background/50 p-4 rounded-lg border border-primary/5">
              {enhancedText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
