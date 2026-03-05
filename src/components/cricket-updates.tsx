'use client';

import { useState, useEffect } from 'react';
import { Dribbble, Loader2, RefreshCw } from 'lucide-react';
import { getCricketUpdates, type CricketMatch } from '@/ai/flows/get-cricket-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

export default function CricketUpdates() {
  const [mounted, setMounted] = useState(false);
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const { matches } = await getCricketUpdates();
      setMatches(matches);
    } catch (error) {
      console.error('Failed to fetch cricket updates:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load scores',
        description: 'There was a problem fetching live cricket data. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000); // Auto-refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const renderScore = (score: CricketMatch['score']) => {
    if (!score || score.length === 0) return <span className="text-sm text-muted-foreground">Score not available</span>;
    return score.map((s, i) => (
      <div key={i} className="font-mono text-lg">
        <span className="font-semibold">{s.inning.split(' ')[0]}: </span>
        <span>{s.r}/{s.w}</span>
        <span className="text-sm text-muted-foreground ml-1">({s.o})</span>
      </div>
    ));
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-secondary/30">
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <Skeleton className="h-4 w-full mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Live Cricket Scores</h1>
          <p className="text-muted-foreground mt-2">Real-time updates from the world of cricket.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchMatches} disabled={isLoading} aria-label="Refresh Scores">
          <RefreshCw className={cn('h-5 w-5', isLoading && 'animate-spin')} />
        </Button>
      </div>
      
      {isLoading && matches.length === 0 ? renderSkeleton() : (
        <div className="grid grid-cols-1 gap-4">
          {matches.length > 0 ? (
            matches.map(match => (
              <Card key={match.id} className="bg-secondary/30 border-2 border-primary/10 hover:border-primary/20 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{match.name}</CardTitle>
                  <p className="text-xs text-muted-foreground pt-1">
                    {formatDate(match.date)} {match.venue ? `at ${match.venue}` : ''}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold">{match.teams[0]}</p>
                    <p className="text-sm text-muted-foreground">vs</p>
                    <p className="text-sm font-semibold">{match.teams[1]}</p>
                  </div>
                  <div className="space-y-1">
                    {renderScore(match.score)}
                  </div>
                  <p className="text-primary text-sm font-semibold mt-3">{match.status}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-secondary/20 rounded-lg">
                <Dribbble className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Live Matches</h3>
                <p className="mt-2 text-sm text-muted-foreground">There are no live cricket matches to display right now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
