'use server';
/**
 * @fileOverview Fetches images from Unsplash based on a text prompt.
 *
 * - generateImageFromPrompt - A function that handles the image search process.
 * - ImageGenerationInput - The input type for the generateImageFromPrompt function.
 * - ImageGenerationOutput - The return type for the generateImageFromPrompt function.
 */

import {z} from 'genkit';

const ImageGenerationInputSchema = z.object({
  prompt: z.string().describe('The prompt to search for on Unsplash.'),
});
export type ImageGenerationInput = z.infer<typeof ImageGenerationInputSchema>;

const ImageGenerationOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the found image.'),
});
export type ImageGenerationOutput = z.infer<typeof ImageGenerationOutputSchema>;

export async function generateImageFromPrompt(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    throw new Error('Unsplash Access Key is not configured. Please add UNSPLASH_ACCESS_KEY to your .env file.');
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.append('query', input.prompt);
  url.searchParams.append('per_page', '1');
  url.searchParams.append('client_id', accessKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Using the 'regular' size image for a balance of quality and performance.
      const imageUrl = data.results[0].urls.regular;
      return { imageUrl };
    } else {
      throw new Error('No images found for the given prompt.');
    }
  } catch (error) {
    console.error('Failed to fetch image from Unsplash:', error);
    throw new Error('There was a problem fetching an image from Unsplash. Please try a different prompt.');
  }
}
