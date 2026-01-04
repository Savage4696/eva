'use client';

import Header from '@/components/header';
import Generator from '@/components/generator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full container mx-auto px-4 py-8 md:py-12">
        <Generator />
      </main>
    </div>
  );
}
