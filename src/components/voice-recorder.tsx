'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

const LIVE_TRANSCRIPTION_INTERVAL = 2000; // 2 seconds

export default function VoiceRecorder() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveTranscriptionTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const processLiveChunk = useCallback(async () => {
    if (audioChunksRef.current.length === 0 || isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await speechToText({ audioDataUri: base64Audio });
        if (result.transcript) {
          setTranscript(result.transcript);
        }
      };
    } catch (error) {
      console.error('Live transcription failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);


  const handleStartRecording = async () => {
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (liveTranscriptionTimer.current) {
          clearInterval(liveTranscriptionTimer.current);
        }
        await processLiveChunk(); 
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(LIVE_TRANSCRIPTION_INTERVAL);
      liveTranscriptionTimer.current = setInterval(processLiveChunk, LIVE_TRANSCRIPTION_INTERVAL + 500);
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
    }
  };

  const renderOutput = () => {
    const outputContainerClasses = "w-full bg-secondary/30 rounded-lg p-6 min-h-[300px] flex items-center justify-center transition-all duration-300";

    if (isRecording && !transcript) {
        return (
          <div className={cn(outputContainerClasses, "animate-in fade-in-50")}>
              <div className="w-full max-w-md space-y-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Listening...</p>
              </div>
          </div>
        );
      }

    return (
      <div className={cn(outputContainerClasses, transcript ? "border-2 border-primary/20" : "border border-dashed")}>
        <div className="w-full max-w-md text-center">
            {transcript ? (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-left">{transcript}</p>
            ) : <p className="text-muted-foreground">Your live transcript will appear here.</p>}
        </div>
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 opacity-0">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Live Voice-to-Text</h1>
            <p className="text-muted-foreground mt-2">Get an instant transcript as you speak with Gemini.</p>
        </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          size="lg"
          className={cn(
            'rounded-full h-20 w-20 transition-all duration-300 relative',
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary'
          )}
        >
          {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
          {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </Button>
        <p className="text-sm text-muted-foreground">
          {isRecording ? 'Recording... Click to stop.' : 'Click to start live transcription.'}
        </p>
      </div>

      <div className="mt-8">
        {renderOutput()}
      </div>
    </div>
  );
}
