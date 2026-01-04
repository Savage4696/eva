'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Generator from '@/components/generator';

const MAX_REQUESTS = 20;

export default function Home() {
  const [requestCount, setRequestCount] = useState(0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header requestCount={requestCount} maxRequests={MAX_REQUESTS} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Generator
          requestCount={requestCount}
          setRequestCount={setRequestCount}
          maxRequests={MAX_REQUESTS}
        />
      </main>
    </div>
  );
}
