import { z } from 'zod';

export const HotelReviewSchema = z.object({
  hotelName: z.string().describe('Name of the hotel'),
  location: z.string().optional().describe('Hotel location or city'),
  rating: z.number().min(1).max(5).describe('Overall rating from 1-5'),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']).describe('Overall sentiment of the review'),
  aspects: z.object({
    cleanliness: z.number().min(1).max(5).optional().describe('Cleanliness rating'),
    service: z.number().min(1).max(5).optional().describe('Service quality rating'),
    location: z.number().min(1).max(5).optional().describe('Location convenience rating'),
    value: z.number().min(1).max(5).optional().describe('Value for money rating'),
    amenities: z.number().min(1).max(5).optional().describe('Amenities quality rating'),
  }).describe('Specific aspect ratings mentioned in the review'),
  highlights: z.array(z.string()).describe('Positive points mentioned'),
  issues: z.array(z.string()).describe('Negative points or complaints mentioned'),
  reviewerType: z.enum(['business', 'leisure', 'family', 'couple', 'solo', 'unknown']).describe('Type of traveler'),
  summary: z.string().describe('Brief summary of the review'),
});

export type HotelReview = z.infer<typeof HotelReviewSchema>;
