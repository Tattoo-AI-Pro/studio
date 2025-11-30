'use server';

/**
 * @fileOverview This file defines the AI-Book compilation flow, which takes the AI-Book data and generates a PDF,
 * responsive web version, mini-site for sales, promotional files, marketing copies, cover art, and 3D mockups.
 *
 * - aiBookCompilation - A function that handles the AI-Book compilation process.
 * - AiBookCompilationInput - The input type for the aiBookCompilation function.
 * - AiBookCompilationOutput - The return type for the aiBookCompilation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiBookCompilationInputSchema = z.object({
  aiBookName: z.string().describe('The name of the AI-Book.'),
  description: z.string().describe('A detailed description of the AI-Book.'),
  targetAudience: z.string().describe('The target audience for the AI-Book.'),
  modules: z.array(
    z.object({
      name: z.string().describe('The name of the module.'),
      subDescription: z.string().describe('A sub-description of the module.'),
      images: z.array(z.string().describe('Base64 encoded image data.')),
    })
  ).describe('An array of modules within the AI-Book, each containing images and descriptions.'),
});
export type AiBookCompilationInput = z.infer<typeof AiBookCompilationInputSchema>;

const AiBookCompilationOutputSchema = z.object({
  pdfDataUri: z.string().describe('The data URI of the generated PDF.'),
  webVersionUrl: z.string().describe('The URL of the responsive web version.'),
  miniSiteHtml: z.string().describe('The HTML content of the mini-site for sales.'),
  promotionalFiles: z.array(z.string()).describe('An array of links to promotional files.'),
  marketingCopies: z.string().describe('Marketing copy generated for the AI-Book.'),
  coverArtDataUri: z.string().describe('The data URI of the generated cover art.'),
  mockups3D: z.array(z.string()).describe('An array of links to 3D mockups.'),
});
export type AiBookCompilationOutput = z.infer<typeof AiBookCompilationOutputSchema>;

export async function aiBookCompilation(input: AiBookCompilationInput): Promise<AiBookCompilationOutput> {
  return aiBookCompilationFlow(input);
}

const aiBookCompilationPrompt = ai.definePrompt({
  name: 'aiBookCompilationPrompt',
  input: {schema: AiBookCompilationInputSchema},
  output: {schema: AiBookCompilationOutputSchema},
  prompt: `You are an AI assistant designed to compile AI-Books from provided data. Your goal is to generate various marketing assets including a PDF version, web version, mini-site, promotional files, marketing copies, cover art, and 3D mockups.

AI-Book Name: {{{aiBookName}}}
Description: {{{description}}}
Target Audience: {{{targetAudience}}}
Modules: {{#each modules}}Module Name: {{{name}}}, Sub-description: {{{subDescription}}}, Number of Images: {{images.length}}{{/each}}

Based on the provided AI-Book data, generate the following assets:

1.  PDF (data URI): A PDF version of the AI-Book formatted for easy reading and distribution.
2.  Web Version (URL): A responsive web version of the AI-Book, accessible via a URL.
3.  Mini-Site (HTML): HTML code for a simple mini-site to promote and sell the AI-Book.
4.  Promotional Files: An array of links to various promotional files (e.g., social media banners, ads).
5.  Marketing Copies: Compelling marketing copy to be used in ads, emails, and product descriptions.
6.  Cover Art (data URI): A visually appealing cover art for the AI-Book.
7.  3D Mockups: An array of links to 3D mockups showcasing the AI-Book in different contexts.

Ensure that the generated assets are high-quality and effectively promote the AI-Book to its target audience.`,
});

const aiBookCompilationFlow = ai.defineFlow(
  {
    name: 'aiBookCompilationFlow',
    inputSchema: AiBookCompilationInputSchema,
    outputSchema: AiBookCompilationOutputSchema,
  },
  async input => {
    const {output} = await aiBookCompilationPrompt(input);
    return output!;
  }
);
