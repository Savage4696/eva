'use server';

/**
 * @fileOverview Enforces usage limits for AI model requests.
 *
 * - checkUsageLimits - Checks if the user is within the usage limits and prevents further requests if the limit is reached.
 * - UsageLimitEnforcementInput - The input type for the checkUsageLimits function.
 * - UsageLimitEnforcementOutput - The return type for the checkUsageLimits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UsageLimitEnforcementInputSchema = z.object({
  requestCount: z
    .number()
    .describe('The number of requests made by the user so far.'),
  maxRequests: z
    .number()
    .describe('The maximum number of requests allowed for the user.'),
});
export type UsageLimitEnforcementInput = z.infer<typeof UsageLimitEnforcementInputSchema>;

const UsageLimitEnforcementOutputSchema = z.object({
  isWithinLimit: z
    .boolean()
    .describe('Whether the user is within the usage limits.'),
  message: z.string().describe('A message indicating whether the limit is reached.'),
});
export type UsageLimitEnforcementOutput = z.infer<typeof UsageLimitEnforcementOutputSchema>;

export async function checkUsageLimits(
  input: UsageLimitEnforcementInput
): Promise<UsageLimitEnforcementOutput> {
  return usageLimitEnforcementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'usageLimitEnforcementPrompt',
  input: {schema: UsageLimitEnforcementInputSchema},
  output: {schema: UsageLimitEnforcementOutputSchema},
  prompt: `You are a usage limit enforcer. Determine if the user is within the usage limits based on the request count and maximum requests allowed.\n\nRequest Count: {{{requestCount}}}\nMax Requests: {{{maxRequests}}}\n\nIf the request count is less than the maximum requests, then the user is within the limit; set isWithinLimit to true and provide a message indicating that the user can proceed. Otherwise, set isWithinLimit to false and provide a message indicating that the limit has been reached.\n\nOutput in JSON format: {"isWithinLimit": boolean, "message": string}`,
});

const usageLimitEnforcementFlow = ai.defineFlow(
  {
    name: 'usageLimitEnforcementFlow',
    inputSchema: UsageLimitEnforcementInputSchema,
    outputSchema: UsageLimitEnforcementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
