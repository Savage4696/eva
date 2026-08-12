'use server';
/**
 * @fileOverview An AI prompt enhancement agent.
 *
 * - enhancePrompt - A function that handles the prompt improvement process.
 * - EnhancePromptInput - The input type for the enhancePrompt function.
 * - EnhancePromptOutput - The return type for the enhancePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePromptInputSchema = z.object({
  prompt: z.string().describe('The simple prompt to be enhanced.'),
});
export type EnhancePromptInput = z.infer<typeof EnhancePromptInputSchema>;

const EnhancePromptOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The detailed, professional-grade version of the prompt.'),
});
export type EnhancePromptOutput = z.infer<typeof EnhancePromptOutputSchema>;

export async function enhancePrompt(input: EnhancePromptInput): Promise<EnhancePromptOutput> {
  return enhancePromptFlow(input);
}

const enhancePromptFlow = ai.defineFlow(
  {
    name: 'enhancePromptFlow',
    inputSchema: EnhancePromptInputSchema,
    outputSchema: EnhancePromptOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      model: 'googleai/gemini-3.6-flash',
      system: "You are an expert prompt engineer. Your goal is to transform a simple, short user prompt into a high-quality, detailed, and effective prompt for an AI. Focus on adding context, specifying tone, defining the output format, and providing clear constraints. Keep the core intent of the original prompt but make it much more descriptive.",
      prompt: `Enhance this prompt: "${input.prompt}"`,
    });

    return {
      enhancedPrompt: text || "I couldn't enhance that prompt. Please try a more descriptive starting point.",
    };
  }
);
