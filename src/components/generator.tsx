'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Image as ImageIcon, AudioWaveform, Loader2, Sparkles, Dribbble, Mic, BrainCircuit, AlertCircle, Wand2, GraduationCap, Briefcase, UserRound, Download } from 'lucide-react';
import Image from 'next/image';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { textGenerationFromPrompt, type TextGenerationMode } from '@/ai/flows/text-generation-from-prompt';
import { generateImageFromPrompt } from '@/ai/flows/image-generation-from-prompt';
import { generateAudioFromText } from '@/ai/flows/audio-generation-from-text';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import CricketUpdates from './cricket-updates';
import VoiceRecorder from './voice-recorder';
import SmartAssistant from './smart-assistant';
import PromptEnhancer from './prompt-enhancer';
import UsageBar from './usage-bar';
import { useUsageLimit } from '@/hooks/use-usage-limit';

const formSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
  mode: z.enum(['general', 'humanizer', 'academic', 'professional']).default('general'),
});

type FormValues = z.infer<typeof formSchema>;

type GeneratorType = 'text' | 'image' | 'audio' | 'voice' | 'cricket' | 'assistant' | 'prompt-gen';

export default function Generator() {
  const { toast } = useToast();
  const { isLimitReached, incrementUsage } = useUsageLimit();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<GeneratorType>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [generatedAudioDataUri, setGeneratedAudioDataUri] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const imagePlaceholder = PlaceHolderImages.find(img => img.id === 'image-placeholder');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '', mode: 'general' },
    mode: 'onChange',
  });

  const handleGeneration: SubmitHandler<FormValues> = async (data) => {
    if (isLimitReached) {
      toast({
        variant: 'destructive',
        title: 'Daily Limit Reached',
        description: 'You have reached your limit of 20 requests for today. Please come back tomorrow!',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'text') {
        setGeneratedText('');
        const result = await textGenerationFromPrompt({ 
          prompt: data.prompt,
          mode: data.mode as TextGenerationMode 
        });
        setGeneratedText(result.text);
        incrementUsage();
      } else if (activeTab === 'image') {
        setGeneratedImageUrl('');
        const result = await generateImageFromPrompt({ prompt: data.prompt });
        setGeneratedImageUrl(result.imageUrl);
        incrementUsage();
      } else if (activeTab === 'audio') {
        setGeneratedAudioDataUri('');
        const result = await generateAudioFromText({ prompt: data.prompt });
        setGeneratedAudioDataUri(result.audioDataUri);
        incrementUsage();
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
    if (value !== 'cricket' && value !== 'voice' && value !== 'assistant' && value !== 'prompt-gen') {
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
                  <div className="flex flex-col items-center gap-4 w-full">
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
                    {generatedImageUrl && (
                      <Button asChild size="sm" variant="outline" className="gap-2">
                        <a href={generatedImageUrl} target="_blank" rel="noopener noreferrer" download="eva-ai-image.jpg">
                          <Download className="h-4 w-4" />
                          Download Image
                        </a>
                      </Button>
                    )}
                  </div>
                );
              case 'audio':
                return generatedAudioDataUri ? (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <audio controls src={generatedAudioDataUri} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <a href={generatedAudioDataUri} download="eva-ai-audio.wav">
                        <Download className="h-4 w-4" />
                        Download Audio
                      </a>
                    </Button>
                  </div>
                ) : <p className="text-muted-foreground">Your generated audio will appear here.</p>;
              default:
                return null;
            }
          })()}
        </div>
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 opacity-0">
        <Skeleton className="h-10 w-full max-w-lg mx-auto mb-8" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      <UsageBar />
      
      {isLimitReached && (
        <Alert variant="destructive" className="max-w-2xl mx-auto mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Usage Limit Reached</AlertTitle>
          <AlertDescription>
            You've used all your credits for today. Generation features are currently locked.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 max-w-4xl">
                <TabsTrigger value="text" className="text-xs md:text-sm"><FileText className="mr-1 h-4 w-4" />Text</TabsTrigger>
                <TabsTrigger value="image" className="text-xs md:text-sm"><ImageIcon className="mr-1 h-4 w-4" />Image</TabsTrigger>
                <TabsTrigger value="audio" className="text-xs md:text-sm"><AudioWaveform className="mr-1 h-4 w-4" />TTS</TabsTrigger>
                <TabsTrigger value="voice" className="text-xs md:text-sm"><Mic className="mr-1 h-4 w-4" />Voice</TabsTrigger>
                <TabsTrigger value="prompt-gen" className="text-xs md:text-sm"><Wand2 className="mr-1 h-4 w-4" />Prompt</TabsTrigger>
                <TabsTrigger value="assistant" className="text-xs md:text-sm font-semibold text-primary"><BrainCircuit className="mr-1 h-4 w-4" />Assistant</TabsTrigger>
                <TabsTrigger value="cricket" className="text-xs md:text-sm"><Dribbble className="mr-1 h-4 w-4" />Scores</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="text" className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Advanced Text Generation</h1>
              <p className="text-muted-foreground mt-2">Specialized modes for humanized, academic, or professional content.</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGeneration)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Your Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={`Enter your request... e.g., "Summarize the findings of the latest AI safety report"`}
                              className="min-h-[150px] resize-none text-base p-4 bg-secondary/40 focus-visible:ring-primary"
                              {...field}
                              disabled={isLimitReached}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Generation Mode</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-secondary/40">
                                <SelectValue placeholder="Select a mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4" />
                                  <span>General Assistant</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="humanizer">
                                <div className="flex items-center gap-2">
                                  <UserRound className="h-4 w-4" />
                                  <span>Humanizer</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="academic">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>Academic Helper</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="professional">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4" />
                                  <span>Professional Research</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {field.value === 'humanizer' && "Rewrites text to sound more natural and less like AI."}
                            {field.value === 'academic' && "Optimized for school work, research papers, and formal study."}
                            {field.value === 'professional' && "Designed for business communication and professional reports."}
                            {field.value === 'general' && "Standard versatile AI responses."}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading || isLimitReached}>
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Working...</>
                      ) : (
                        <><Sparkles className="mr-2 h-5 w-5" />Generate</>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
             <div className="mt-8">
              {renderOutput()}
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Image Search</h1>
              <p className="text-muted-foreground mt-2">Find high-quality images via Unsplash.</p>
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
                          placeholder={`Enter a keyword to search for... e.g., "A photo of a futuristic city at sunset"`}
                          className="min-h-[120px] resize-none text-base p-4 bg-secondary/40 focus-visible:ring-primary"
                          {...field}
                          disabled={isLimitReached}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading || isLimitReached}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...</>
                  ) : (
                    <><ImageIcon className="mr-2 h-5 w-5" />Find Image</>
                  )}
                </Button>
              </form>
            </Form>
             <div className="mt-8">
              {renderOutput()}
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Audio Generation</h1>
              <p className="text-muted-foreground mt-2">Create realistic speech from a simple text prompt.</p>
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
                          disabled={isLimitReached}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading || isLimitReached}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Synthesizing...</>
                  ) : (
                    <><AudioWaveform className="mr-2 h-5 w-5" />Generate Speech</>
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

          <TabsContent value="prompt-gen">
            <PromptEnhancer />
          </TabsContent>

          <TabsContent value="assistant">
            <SmartAssistant />
          </TabsContent>

          <TabsContent value="cricket">
            <CricketUpdates />
          </TabsContent>
      </Tabs>
    </div>
  );
}
