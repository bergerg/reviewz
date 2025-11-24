import { parseHotelReview, type HotelReview } from '../parser';
import { validateHotelReview, type ValidationResult } from '../validator';
import { extractEntities, type NamedEntities } from '../entity-extractor';
import type { Review } from '../common/types';

export interface WorkflowResult {
  review: HotelReview;
  entities: NamedEntities;
  validation: ValidationResult;
}

export async function processReview(input: Review): Promise<WorkflowResult> {
  // Step 1: Parse
  const review = await parseHotelReview(input);

  // Step 2: Extract entities
  const entities = await extractEntities(input);

  // Step 3: Validate
  const validation = validateHotelReview(review, input);

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  return {
    review,
    entities,
    validation
  };
}
