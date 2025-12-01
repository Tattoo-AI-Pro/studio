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
  significado_literal: z.string().describe("The literal meaning of the tattoo."),
  significado_subjetivo: z.string().describe("The subjective meaning of the tattoo."),
  cores_usadas: z.array(z.string()).describe("The colors used in the tattoo."),
  elementos_presentes: z.array(z.string()).describe("The elements present in the tattoo."),
  tom_emocional: z.string().describe("The emotional tone of the tattoo."),
  local_sugerido: z.string().describe("A suggested body part for the tattoo."),
  simbolismo: z.string().describe("The symbolism of the tattoo."),
  referencia_cultural: z.string().describe("The cultural reference of the tattoo."),
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
- Literal Meaning: Describe what the tattoo literally depicts.
- Subjective Meaning: Describe what the tattoo could subjectively represent.
- Colors Used: List the main colors present in the tattoo.
- Elements Present: List the key visual elements in the tattoo.
- Emotional Tone: Describe the emotional tone or feeling of the tattoo (e.g., melancholic, powerful, joyful).
- Suggested Body Part: Suggest a good placement on the body for this tattoo.
- Symbolism: Explain any symbolism associated with the elements in the tattoo.
- Cultural Reference: Note any cultural references present in the tattoo.


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
