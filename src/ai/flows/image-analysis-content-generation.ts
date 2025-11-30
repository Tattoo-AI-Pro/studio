'use server';

/**
 * @fileOverview Analyzes tattoo images, classifies them by theme and style, and generates content.
 *
 * - analyzeImageAndGenerateContent - A function that handles image analysis and content generation.
 * - ImageAnalysisInput - The input type for the analyzeImageAndGenerateContent function.
 * - ImageAnalysisOutput - The return type for the analyzeImageAndGenerateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageAnalysisInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A tattoo image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageAnalysisInput = z.infer<typeof ImageAnalysisInputSchema>;

const ImageAnalysisOutputSchema = z.object({
  theme: z.string().describe('The theme of the tattoo image.'),
  style: z.string().describe('The style of the tattoo image.'),
  suggestedName: z.string().describe('A suggested name for the tattoo image.'),
  description: z.string().describe('A description of the tattoo image.'),
  seoTags: z.array(z.string()).describe('SEO tags for the tattoo image.'),
  instagramCaption: z.string().describe('An Instagram caption for the tattoo image.'),
});
export type ImageAnalysisOutput = z.infer<typeof ImageAnalysisOutputSchema>;

export async function analyzeImageAndGenerateContent(
  input: ImageAnalysisInput
): Promise<ImageAnalysisOutput> {
  return analyzeImageAndGenerateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageAnalysisContentGenerationPrompt',
  input: {schema: ImageAnalysisInputSchema},
  output: {schema: ImageAnalysisOutputSchema},
  prompt: `You are an AI assistant specializing in tattoo image analysis and content generation.

You will analyze the provided tattoo image and generate the following:
- Theme: Identify the main theme of the tattoo (e.g., floral, geometric, portrait).
- Style: Determine the tattoo style (e.g., realism, minimalist, traditional).
- Suggested Name: Create a catchy and relevant name for the tattoo.
- Description: Write a detailed description of the tattoo, highlighting its key features.
- SEO Tags: Generate relevant SEO tags to improve searchability.
- Instagram Caption: Craft an engaging Instagram caption for the tattoo.

Analyze the following tattoo image:

{{media url=imageDataUri}}
`,
});

const analyzeImageAndGenerateContentFlow = ai.defineFlow(
  {
    name: 'analyzeImageAndGenerateContentFlow',
    inputSchema: ImageAnalysisInputSchema,
    outputSchema: ImageAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
