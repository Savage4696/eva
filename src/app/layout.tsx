import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import BackgroundEffects from '@/components/background-effects';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});


export const metadata: Metadata = {
  title: 'Eva AI',
  description: 'Generate text, images, and audio with free-tier AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={cn("h-full font-sans antialiased relative", inter.variable)}>
        <BackgroundEffects />
        {children}
        <Toaster />
      </body>
    </html>
  );
}