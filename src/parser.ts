import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HotelReviewSchema, type HotelReview } from './schema';
import type { Review } from './types';

export async function parseHotelReview(input: Review): Promise<HotelReview> {
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const structuredModel = model.withStructuredOutput(HotelReviewSchema);

  const prompt = `Hotel: ${input.hotelName}
Location: ${input.location}
User Score: ${input.score}/5

Review Text:
${input.review}`;

  const result = await structuredModel.invoke([
    {
      role: 'system',
      content: 'You are an expert at analyzing hotel reviews. Extract structured information from the provided review. Use the hotel name, location, and score provided in the context.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);

  return result;
}
