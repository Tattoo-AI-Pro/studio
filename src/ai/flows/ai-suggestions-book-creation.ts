'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI-Book suggestions based on user inputs.
 *
 * - generateAiBookSuggestions - A function that generates AI-Book suggestions.
 * - AiBookSuggestionsInput - The input type for the generateAiBookSuggestions function.
 * - AiBookSuggestionsOutput - The return type for the generateAiBookSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiBookSuggestionsInputSchema = z.object({
  name: z.string().describe('The name of the AI-Book.'),
  price: z.number().describe('The price of the AI-Book.'),
  description: z.string().describe('The user-provided description of the AI-Book.'),
  targetAudience: z.string().describe('The target audience for the AI-Book.'),
});
export type AiBookSuggestionsInput = z.infer<typeof AiBookSuggestionsInputSchema>;

const AiBookSuggestionsOutputSchema = z.object({
  suggestedTitle: z.string().describe('An AI-suggested title for the AI-Book.'),
  improvedDescription: z.string().describe('An AI-improved description for the AI-Book.'),
  suggestedStructure: z.string().describe('An AI-suggested structure for the AI-Book, including module ideas.'),
  salesPitch: z.string().describe('An AI-generated sales pitch for the AI-Book'),
});
export type AiBookSuggestionsOutput = z.infer<typeof AiBookSuggestionsOutputSchema>;

export async function generateAiBookSuggestions(input: AiBookSuggestionsInput): Promise<AiBookSuggestionsOutput> {
  return generateAiBookSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiBookSuggestionsPrompt',
  input: {schema: AiBookSuggestionsInputSchema},
  output: {schema: AiBookSuggestionsOutputSchema},
  prompt: `You are an AI assistant helping a user create an AI-Book. Based on the following information, suggest a better title, improve the description, suggest a base structure (including module ideas), and create a sales pitch for the AI-Book.

AI-Book Name: {{{name}}}
Price: {{{price}}}
Description: {{{description}}}
Target Audience: {{{targetAudience}}}

Ensure the suggested structure includes multiple module ideas.
`,
});

const generateAiBookSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateAiBookSuggestionsFlow',
    inputSchema: AiBookSuggestionsInputSchema,
    outputSchema: AiBookSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
