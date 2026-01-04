'use client';
import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">OmniFreeGen</h1>
        </div>
      </div>
    </header>
  );
}
