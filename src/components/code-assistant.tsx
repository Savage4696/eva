'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Code2, Bug, Terminal, Copy, Check, Loader2, Sparkles, Wand2, Lightbulb } from 'lucide-react';
import { codeAssistant, type CodeAssistantOutput } from '@/ai/flows/code-assistant';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useUsageLimit } from '@/hooks/use-usage-limit';

const formSchema = z.object({
  prompt: z.string().min(5, 'Input is too short.'),
  errorContext: z.string().optional(),
  mode: z.enum(['generate', 'debug']).default('generate'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CodeAssistant() {
  const { toast } = useToast();
  const { isLimitReached, incrementUsage } = useUsageLimit();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CodeAssistantOutput | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '', errorContext: '', mode: 'generate' },
  });

  const handleAction: SubmitHandler<FormValues> = async (data) => {
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
      const response = await codeAssistant(data);
      setResult(response);
      incrementUsage();
    } catch (error) {
      console.error('Code assistant failed:', error);
      toast({
        variant: 'destructive',
        title: 'Request failed',
        description: 'There was a problem processing your code request.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    setIsCopied(true);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!mounted) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  const mode = form.watch('mode');

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">AI Code Assistant</h1>
        <p className="text-muted-foreground mt-2">Generate snippets or fix bugs with detailed explanations.</p>
      </div>

      <div className="bg-secondary/20 p-6 rounded-xl border border-primary/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAction)} className="space-y-6">
            <div className="flex justify-center">
              <Tabs 
                value={mode} 
                onValueChange={(val) => form.setValue('mode', val as 'generate' | 'debug')} 
                className="w-full max-w-xs"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="generate"><Code2 className="mr-2 h-4 w-4" /> Generate</TabsTrigger>
                  <TabsTrigger value="debug"><Bug className="mr-2 h-4 w-4" /> Fix/Debug</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{mode === 'generate' ? 'What do you want to build?' : 'Paste your broken code'}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={mode === 'generate' ? 'e.g., "A React hook for debouncing search input"' : 'Paste the code that is causing issues...'}
                        className="min-h-[150px] font-mono bg-background/50 border-primary/5 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === 'debug' && (
                <FormField
                  control={form.control}
                  name="errorContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Error Log / Context (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the error message or stack trace here..."
                          className="min-h-[100px] font-mono bg-background/50 border-primary/5"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Providing the error message helps Gemini find the fix faster.</FormDescription>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button type="submit" size="lg" className="w-full font-bold" disabled={isLoading || isLimitReached}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {mode === 'generate' ? 'Generating...' : 'Debugging...'}</>
              ) : (
                <>{mode === 'generate' ? <Sparkles className="mr-2 h-5 w-5" /> : <Terminal className="mr-2 h-5 w-5" />} {mode === 'generate' ? 'Generate Code' : 'Fix My Code'}</>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-secondary/30 p-6 rounded-xl border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-lg border-b border-primary/10 pb-2">
              <Lightbulb className="h-5 w-5" />
              <span>{mode === 'generate' ? 'Explanation' : 'Diagnosis'}</span>
            </div>
            <p className="text-foreground leading-relaxed">{result.explanation}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {result.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 bg-background/40 p-3 rounded-lg border border-primary/5">
                  <div className="bg-primary/10 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute top-4 right-4 z-10">
              <Button variant="secondary" size="sm" onClick={copyToClipboard} className="h-8 gap-2 bg-background/80 backdrop-blur-sm border-primary/10">
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {isCopied ? 'Copied' : 'Copy Code'}
              </Button>
            </div>
            <div className="rounded-xl overflow-hidden border border-primary/20 shadow-xl">
              <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-primary/10">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-2">Output Snippet</span>
              </div>
              <pre className="p-6 bg-[#0d1117] text-white overflow-x-auto text-sm leading-relaxed font-mono min-h-[200px]">
                <code>{result.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
