import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { NamedEntitiesSchema, type NamedEntities } from './schema';
import type { Review } from '../common/types';

export async function extractEntities(input: Review): Promise<NamedEntities> {
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const structuredModel = model.withStructuredOutput(NamedEntitiesSchema);

  const result = await structuredModel.invoke([
    {
      role: 'system',
      content: 'You are an expert at extracting named entities from hotel reviews. Extract all relevant entities mentioned in the review text.',
    },
    {
      role: 'user',
      content: input.review,
    },
  ]);

  return result;
}
