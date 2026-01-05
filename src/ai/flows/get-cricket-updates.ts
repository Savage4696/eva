'use server';
/**
 * @fileOverview Fetches live cricket match data.
 *
 * - getCricketUpdates - A function that fetches current cricket matches.
 * - CricketUpdate - The type for a single cricket match update.
 */

import { z } from 'genkit';

const CricketMatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  venue: z.string().optional(),
  date: z.string(),
  teams: z.array(z.string()),
  score: z.array(z.object({
    r: z.number(),
    w: z.number(),
    o: z.number(),
    inning: z.string(),
  })),
});

export type CricketMatch = z.infer<typeof CricketMatchSchema>;

const CricketUpdatesOutputSchema = z.object({
  matches: z.array(CricketMatchSchema),
});

export type CricketUpdatesOutput = z.infer<typeof CricketUpdatesOutputSchema>;

export async function getCricketUpdates(): Promise<CricketUpdatesOutput> {
  const apiKey = process.env.CRICKET_DATA_API_KEY;

  if (!apiKey) {
    throw new Error('Cricket Data API Key is not configured. Please add CRICKET_DATA_API_KEY to your .env file.');
  }

  // A free API endpoint from cricketdata.org. In a real app, you might want to fetch a specific series or match.
  const url = new URL('https://api.cricapi.com/v1/currentMatches');
  url.searchParams.append('apikey', apiKey);
  url.searchParams.append('offset', '0');
  
  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "success" || !data.data) {
        throw new Error(data.reason || 'Failed to fetch cricket data.');
    }

    // Filter and map to a cleaner format if necessary
    const matches = data.data.slice(0, 5).map((match: any) => ({
      id: match.id,
      name: match.name,
      status: match.status,
      venue: match.venue,
      date: match.date,
      teams: match.teams,
      score: match.score || [],
    }));
    
    return { matches };

  } catch (error) {
    console.error('Failed to fetch from Cricket Data API:', error);
    throw new Error('There was a problem fetching live cricket data.');
  }
}
