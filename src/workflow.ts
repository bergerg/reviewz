import { parseHotelReview } from './parser';
import { validateHotelReview, type ValidationResult } from './validator';
import { type HotelReview } from './schema';
import type { Review } from './types';

export interface WorkflowResult {
  review: HotelReview;
  validation: ValidationResult;
}

export async function processReview(input: Review): Promise<WorkflowResult> {
  // Step 1: Parse
  const review = await parseHotelReview(input);

  // Step 2: Validate
  const validation = validateHotelReview(review, input);

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  return {
    review,
    validation
  };
}
