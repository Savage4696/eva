'use server';
/**
 * @fileOverview A code generation and debugging AI agent.
 *
 * - codeAssistant - A function that handles code generation and fixing.
 * - CodeAssistantInput - The input type for the codeAssistant function.
 * - CodeAssistantOutput - The return type for the codeAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeAssistantModeSchema = z.enum(['generate', 'debug']);
export type CodeAssistantMode = z.infer<typeof CodeAssistantModeSchema>;

const CodeAssistantInputSchema = z.object({
  prompt: z.string().describe('The coding request or the code snippet to debug.'),
  errorContext: z.string().optional().describe('Optional error messages or stack traces for debugging.'),
  mode: CodeAssistantModeSchema.default('generate'),
});
export type CodeAssistantInput = z.infer<typeof CodeAssistantInputSchema>;

const CodeAssistantOutputSchema = z.object({
  explanation: z.string().describe('A clear explanation of the code or the bug fix.'),
  code: z.string().describe('The generated or corrected code snippet.'),
  steps: z.array(z.string()).describe('Step-by-step instructions or explanations.'),
});
export type CodeAssistantOutput = z.infer<typeof CodeAssistantOutputSchema>;

export async function codeAssistant(input: CodeAssistantInput): Promise<CodeAssistantOutput> {
  return codeAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeAssistantPrompt',
  input: {schema: CodeAssistantInputSchema},
  output: {schema: CodeAssistantOutputSchema},
  prompt: `You are an expert senior software engineer and debugger. 

{{#if (eq mode "generate")}}
Task: Generate high-quality, efficient, and well-documented code based on the following request.
Request: {{{prompt}}}

Provide a clear explanation of how the code works and why you chose this implementation.
{{else}}
Task: Debug and fix the provided code snippet.
Code to fix:
\`\`\`
{{{prompt}}}
\`\`\`

{{#if errorContext}}
Error Context/Log:
\`\`\`
{{{errorContext}}}
\`\`\`
{{/if}}

Identify the bug, explain why it happened, and provide the corrected code. Break down the fix into clear steps.
{{/if}}

Ensure the output is strictly structured as requested.`,
});

const codeAssistantFlow = ai.defineFlow(
  {
    name: 'codeAssistantFlow',
    inputSchema: CodeAssistantInputSchema,
    outputSchema: CodeAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
