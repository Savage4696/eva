'use client';
import { Bot } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface HeaderProps {
  requestCount: number;
  maxRequests: number;
}

export default function Header({ requestCount, maxRequests }: HeaderProps) {
  const progress = (requestCount / maxRequests) * 100;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">OmniFreeGen</h1>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-muted-foreground">Usage</p>
            <p className="text-xs font-semibold text-foreground">
              {requestCount}/{maxRequests}
            </p>
          </div>
          <Progress value={progress} className="h-2" aria-label={`${requestCount} of ${maxRequests} requests used`} />
        </div>
      </div>
    </header>
  );
}
