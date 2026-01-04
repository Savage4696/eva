'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Image as ImageIcon, AudioWaveform, Loader2, Wand2, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import { textGenerationFromPrompt } from '@/ai/flows/text-generation-from-prompt';
import { generateImageFromPrompt } from '@/ai/flows/image-generation-from-prompt';
import { generateAudioFromText } from '@/ai/flows/audio-generation-from-text';
import { checkUsageLimits } from '@/ai/flows/usage-limit-enforcement';

import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;

type GeneratorType = 'text' | 'image' | 'audio';

interface GeneratorProps {
  requestCount: number;
  setRequestCount: (count: number | ((prevCount: number) => number)) => void;
  maxRequests: number;
}

export default function Generator({ requestCount, setRequestCount, maxRequests }: GeneratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<GeneratorType>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [generatedAudioDataUri, setGeneratedAudioDataUri] = useState('');

  const imagePlaceholder = PlaceHolderImages.find(img => img.id === 'image-placeholder');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '' },
    mode: 'onChange',
  });

  const handleGeneration: SubmitHandler<FormValues> = async (data) => {
    if (requestCount >= maxRequests) {
      toast({
        variant: 'destructive',
        title: 'Request limit reached',
        description: 'You have used all your free requests.',
      });
      return;
    }

    const usageCheck = await checkUsageLimits({
      requestCount: requestCount + 1,
      maxRequests: maxRequests,
    });

    if (!usageCheck.isWithinLimit) {
        toast({
            variant: 'destructive',
            title: 'Usage Limit Warning',
            description: usageCheck.message,
        });
        return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'text') {
        setGeneratedText('');
        const result = await textGenerationFromPrompt({ prompt: data.prompt });
        setGeneratedText(result.text);
      } else if (activeTab === 'image') {
        setGeneratedImageUrl('');
        const result = await generateImageFromPrompt({ prompt: data.prompt });
        setGeneratedImageUrl(result.imageUrl);
      } else if (activeTab === 'audio') {
        setGeneratedAudioDataUri('');
        const result = await generateAudioFromText({ prompt: data.prompt });
        setGeneratedAudioDataUri(result.audioDataUri);
      }
      setRequestCount(prev => prev + 1);
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetOutputs = () => {
    setGeneratedText('');
    setGeneratedImageUrl('');
    setGeneratedAudioDataUri('');
  };

  const onTabChange = (value: string) => {
    setActiveTab(value as GeneratorType);
    form.reset();
    resetOutputs();
  };
  
  const renderOutput = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 w-full p-4">
           {activeTab === 'image' ? (
             <Skeleton className="aspect-square w-full rounded-lg" />
           ) : (
            <>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </>
           )}
        </div>
      );
    }

    switch (activeTab) {
      case 'text':
        return generatedText ? (
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{generatedText}</p>
        ) : <p className="text-muted-foreground">Your generated text will appear here.</p>;
      case 'image':
        const imageUrl = generatedImageUrl || imagePlaceholder?.imageUrl || '';
        return (
          <div className="aspect-square w-full relative overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={generatedImageUrl ? form.getValues('prompt') : "Placeholder image"}
              fill
              className="object-cover transition-all duration-300 hover:scale-105"
              data-ai-hint={generatedImageUrl ? '' : imagePlaceholder?.imageHint}
              unoptimized={!!generatedImageUrl}
            />
          </div>
        );
      case 'audio':
        return generatedAudioDataUri ? (
          <audio controls src={generatedAudioDataUri} className="w-full">
            Your browser does not support the audio element.
          </audio>
        ) : <p className="text-muted-foreground">Your generated audio will appear here.</p>;
      default:
        return null;
    }
  };


  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full max-w-5xl">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="text"><FileText className="mr-2" />Text</TabsTrigger>
        <TabsTrigger value="image"><ImageIcon className="mr-2" />Image</TabsTrigger>
        <TabsTrigger value="audio"><AudioWaveform className="mr-2" />Audio</TabsTrigger>
      </TabsList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wand2 className="text-primary" />
              Create your content
            </CardTitle>
            <CardDescription>Enter a prompt and let our AI work its magic. You have {maxRequests - requestCount} free requests left.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGeneration)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Your Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`e.g., A futuristic cityscape at sunset for an image...`}
                          className="min-h-[150px] resize-none text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading || requestCount >= maxRequests}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" />Generate</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col bg-muted/30">
          <CardHeader>
            <CardTitle className="text-2xl">AI Output</CardTitle>
            <CardDescription>The result of your generation will appear below.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4 min-h-[200px] animate-in fade-in-50 duration-500">
            {renderOutput()}
          </CardContent>
        </Card>
      </div>
    </Tabs>
  );
}
