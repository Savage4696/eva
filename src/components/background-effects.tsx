'use client';

import { useEffect, useState } from 'react';

export default function BackgroundEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Base Grid */}
      <div className="absolute inset-0 bg-grid-white" />
      
      {/* Radial Gradient Glows */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-float" 
        style={{ animationDuration: '18s' }}
      />
      <div 
        className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-500/5 blur-[100px] rounded-full animate-float" 
        style={{ animationDuration: '22s', animationDelay: '-5s' }}
      />
      <div 
        className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-purple-500/5 blur-[130px] rounded-full animate-float" 
        style={{ animationDuration: '25s', animationDelay: '-12s' }}
      />
      
      {/* Vignetee effect to soften edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
    </div>
  );
}