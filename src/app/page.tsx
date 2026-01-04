'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Generator from '@/components/generator';

const MAX_REQUESTS = 20;

export default function Home() {
  const [requestCount, setRequestCount] = useState(0);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header requestCount={requestCount} maxRequests={MAX_REQUESTS} />
      <main className="flex-1 w-full container mx-auto px-4 py-8 md:py-12">
        <Generator
          requestCount={requestCount}
          setRequestCount={setRequestCount}
          maxRequests={MAX_REQUESTS}
        />
      </main>
    </div>
  );
}
