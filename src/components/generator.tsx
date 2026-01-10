'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Image as ImageIcon, AudioWaveform, Loader2, Sparkles, Dribbble, Mic } from 'lucide-react';
import Image from 'next/image';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { textGenerationFromPrompt } from '@/ai/flows/text-generation-from-prompt';
import { generateImageFromPrompt } from '@/ai/flows/image-generation-from-prompt';
import { generateAudioFromText } from '@/ai/flows/audio-generation-from-text';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import CricketUpdates from './cricket-updates';
import VoiceRecorder from './voice-recorder';

const formSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;

type GeneratorType = 'text' | 'image' | 'audio' | 'voice' | 'cricket';

export default function Generator() {
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
    if (value !== 'cricket' && value !== 'voice') {
      form.reset();
      resetOutputs();
    }
  };
  
  const renderOutput = () => {
    const outputContainerClasses = "w-full bg-secondary/30 rounded-lg p-6 min-h-[300px] flex items-center justify-center transition-all duration-300";

    if (isLoading) {
      return (
        <div className={cn(outputContainerClasses, "animate-in fade-in-50")}>
           {activeTab === 'image' ? (
             <Skeleton className="aspect-square w-full max-w-md rounded-lg" />
           ) : (
            <div className="w-full max-w-md space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
           )}
        </div>
      );
    }

    const hasOutput = generatedText || generatedImageUrl || generatedAudioDataUri;

    return (
      <div className={cn(outputContainerClasses, hasOutput ? "border-2 border-primary/20" : "border border-dashed")}>
        <div className="w-full max-w-md text-center">
          {(() => {
            switch (activeTab) {
              case 'text':
                return generatedText ? (
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-left">{generatedText}</p>
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
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 max-w-lg mx-auto">
              <TabsTrigger value="text" className="text-base"><FileText className="mr-2" />Text</TabsTrigger>
              <TabsTrigger value="image" className="text-base"><ImageIcon className="mr-2" />Image</TabsTrigger>
              <TabsTrigger value="audio" className="text-base"><AudioWaveform className="mr-2" />Audio</TabsTrigger>
              <TabsTrigger value="voice" className="text-base"><Mic className="mr-2" />Voice</TabsTrigger>
              <TabsTrigger value="cricket" className="text-base"><Dribbble className="mr-2" />Cricket</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Text Generation</h1>
              <p className="text-muted-foreground mt-2">Create high-quality text from a simple prompt.</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGeneration)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Your Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Enter a prompt to generate text... e.g., "Write a poem about a rainy day"`}
                          className="min-h-[120px] resize-none text-base p-4 bg-secondary/40 focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" />Generate Content</>
                  )}
                </Button>
              </form>
            </Form>
             <div className="mt-8">
              {renderOutput()}
            </div>
          </TabsContent>

          <TabsContent value="image">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Image Generation</h1>
              <p className="text-muted-foreground mt-2">Create stunning images from a simple prompt.</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGeneration)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Your Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Enter a prompt to generate an image... e.g., "A photo of a futuristic city at sunset"`}
                          className="min-h-[120px] resize-none text-base p-4 bg-secondary/40 focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" />Generate Content</>
                  )}
                </Button>
              </form>
            </Form>
             <div className="mt-8">
              {renderOutput()}
            </div>
          </TabsContent>
          
          <TabsContent value="audio">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Audio Generation</h1>
              <p className="text-muted-foreground mt-2">Create realistic speech from a simple prompt.</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGeneration)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Your Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Enter a prompt to generate audio... e.g., "The quick brown fox jumps over the lazy dog."`}
                          className="min-h-[120px] resize-none text-base p-4 bg-secondary/40 focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" />Generate Content</>
                  )}
                </Button>
              </form>
            </Form>
             <div className="mt-8">
              {renderOutput()}
            </div>
          </TabsContent>
          
          <TabsContent value="voice">
            <VoiceRecorder />
          </TabsContent>

          <TabsContent value="cricket">
            <CricketUpdates />
          </TabsContent>
      </Tabs>
    </div>
  );
}
