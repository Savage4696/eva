'use server';

/**
 * @fileOverview A text generation AI agent.
 *
 * - textGenerationFromPrompt - A function that handles the text generation process.
 * - TextGenerationFromPromptInput - The input type for the textGenerationFromPrompt function.
 * - TextGenerationFromPromptOutput - The return type for the textGenerationFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextGenerationFromPromptInputSchema = z.object({
  prompt: z.string().describe('The prompt to use for text generation.'),
});
export type TextGenerationFromPromptInput = z.infer<typeof TextGenerationFromPromptInputSchema>;

const TextGenerationFromPromptOutputSchema = z.object({
  text: z.string().describe('The generated text.'),
});
export type TextGenerationFromPromptOutput = z.infer<typeof TextGenerationFromPromptOutputSchema>;

export async function textGenerationFromPrompt(input: TextGenerationFromPromptInput): Promise<TextGenerationFromPromptOutput> {
  return textGenerationFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textGenerationFromPromptPrompt',
  input: {schema: TextGenerationFromPromptInputSchema},
  output: {schema: TextGenerationFromPromptOutputSchema},
  prompt: `{{{prompt}}}`,
});

const textGenerationFromPromptFlow = ai.defineFlow(
  {
    name: 'textGenerationFromPromptFlow',
    inputSchema: TextGenerationFromPromptInputSchema,
    outputSchema: TextGenerationFromPromptOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: input.prompt,
      model: 'googleai/gemini-2.5-flash',
    });
    return {text};
  }
);
