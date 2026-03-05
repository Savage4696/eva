'use server';
/**
 * @fileOverview A speech-to-text AI agent.
 *
 * - speechToText - A function that handles the audio transcription process.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z.string().describe("The audio clip to transcribe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {media: {url: input.audioDataUri}},
        {text: 'Transcribe the audio exactly as spoken.'},
      ],
    });

    return {transcript: text};
  }
);
