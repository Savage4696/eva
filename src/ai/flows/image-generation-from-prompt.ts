'use server';
/**
 * @fileOverview Generates images from text prompts within free usage limits.
 *
 * - generateImageFromPrompt - A function that handles the image generation process.
 * - ImageGenerationInput - The input type for the generateImageFromPrompt function.
 * - ImageGenerationOutput - The return type for the generateImageFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageGenerationInputSchema = z.object({
  prompt: z.string().describe('The prompt to use to generate the image.'),
});
export type ImageGenerationInput = z.infer<typeof ImageGenerationInputSchema>;

const ImageGenerationOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type ImageGenerationOutput = z.infer<typeof ImageGenerationOutputSchema>;

export async function generateImageFromPrompt(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
  return imageGenerationFlow(input);
}

const imageGenerationFlow = ai.defineFlow(
  {
    name: 'imageGenerationFlow',
    inputSchema: ImageGenerationInputSchema,
    outputSchema: ImageGenerationOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: `Generate an image based on the following prompt: ${input.prompt}`,
      config: {
        responseModalities: ['IMAGE'],
      },
    });
    return {imageUrl: media.url!};
  }
);
