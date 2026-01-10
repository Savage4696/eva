'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2, FileText, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

export default function VoiceRecorder() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access in your browser settings to use this feature.',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await speechToText({ audioDataUri: base64Audio });
        setTranscript(result.transcript);
      };
    } catch (error) {
      console.error('Transcription failed:', error);
      toast({
        variant: 'destructive',
        title: 'Transcription Failed',
        description: 'There was a problem transcribing your audio. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderOutput = () => {
    const outputContainerClasses = "w-full bg-secondary/30 rounded-lg p-6 min-h-[300px] flex items-center justify-center transition-all duration-300";

    if (isLoading) {
      return (
        <div className={cn(outputContainerClasses, "animate-in fade-in-50")}>
            <div className="w-full max-w-md space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
      );
    }

    return (
      <div className={cn(outputContainerClasses, transcript ? "border-2 border-primary/20" : "border border-dashed")}>
        <div className="w-full max-w-md text-center">
            {transcript ? (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-left">{transcript}</p>
            ) : <p className="text-muted-foreground">Your transcript will appear here.</p>}
        </div>
      </div>
    );
  };


  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Voice-to-Text Transcription</h1>
            <p className="text-muted-foreground mt-2">Record your voice and get an instant transcript with Gemini.</p>
        </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          size="lg"
          className={cn(
            'rounded-full h-20 w-20 transition-all duration-300',
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary'
          )}
          disabled={isLoading}
        >
          {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </Button>
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Transcribing...' : isRecording ? 'Recording... Click to stop.' : 'Click to start recording.'}
        </p>
      </div>

      <div className="mt-8">
        {renderOutput()}
      </div>
    </div>
  );
}
