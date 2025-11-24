import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HotelReviewSchema, type HotelReview } from './schema.js';

export async function parseHotelReview(reviewText: string): Promise<HotelReview> {
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const structuredModel = model.withStructuredOutput(HotelReviewSchema);

  const result = await structuredModel.invoke([
    {
      role: 'system',
      content: 'You are an expert at analyzing hotel reviews. Extract structured information from the provided review text.',
    },
    {
      role: 'user',
      content: reviewText,
    },
  ]);

  return result;
}
