'use server';

/**
 * @fileOverview A versatile text generation AI agent with specialized modes.
 *
 * - textGenerationFromPrompt - A function that handles the text generation process.
 * - TextGenerationFromPromptInput - The input type including the generation mode.
 * - TextGenerationFromPromptOutput - The return type for the generated text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextGenerationModeSchema = z.enum(['general', 'humanizer', 'academic', 'professional']);
export type TextGenerationMode = z.infer<typeof TextGenerationModeSchema>;

const TextGenerationFromPromptInputSchema = z.object({
  prompt: z.string().describe('The prompt to use for text generation.'),
  mode: TextGenerationModeSchema.default('general').describe('The style or mode of generation.'),
});
export type TextGenerationFromPromptInput = z.infer<typeof TextGenerationFromPromptInputSchema>;

const TextGenerationFromPromptOutputSchema = z.object({
  text: z.string().describe('The generated text.'),
});
export type TextGenerationFromPromptOutput = z.infer<typeof TextGenerationFromPromptOutputSchema>;

export async function textGenerationFromPrompt(input: TextGenerationFromPromptInput): Promise<TextGenerationFromPromptOutput> {
  return textGenerationFromPromptFlow(input);
}

const textGenerationFromPromptFlow = ai.defineFlow(
  {
    name: 'textGenerationFromPromptFlow',
    inputSchema: TextGenerationFromPromptInputSchema,
    outputSchema: TextGenerationFromPromptOutputSchema,
  },
  async input => {
    let systemInstructions = "You are a helpful AI assistant.";
    
    if (input.mode === 'humanizer') {
      systemInstructions = "You are an expert editor specializing in humanizing AI text. Your goal is to rewrite the input to sound completely natural, like it was written by a human. Avoid repetitive sentence structures, 'AI-isms', and overly formal transitions. Use a conversational yet polished tone.";
    } else if (input.mode === 'academic') {
      systemInstructions = "You are a senior academic researcher and scholarly writer. Your goal is to assist with school work and academic research. Use a formal, objective, and precise tone. Structure your answers clearly, focus on evidence-based explanations, and maintain scholarly standards.";
    } else if (input.mode === 'professional') {
      systemInstructions = "You are a professional business consultant and researcher. Your goal is to provide concise, clear, and actionable professional advice or content. Use a confident, corporate, and efficient tone suitable for business environments.";
    }

    const {text} = await ai.generate({
      system: systemInstructions,
      prompt: input.prompt,
      model: 'googleai/gemini-1.5-flash',
    });
    
    return {text: text || "No text generated."};
  }
);
