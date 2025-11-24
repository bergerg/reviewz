import { HotelReviewSchema, type HotelReview } from './schema';
import type { Review } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateHotelReview(data: unknown, inputReview?: Review): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Schema validation using Zod
  const parseResult = HotelReviewSchema.safeParse(data);
  
  if (!parseResult.success) {
    parseResult.error.issues.forEach(issue => {
      errors.push(`${issue.path.join('.')}: ${issue.message}`);
    });
    return { isValid: false, errors, warnings };
  }

  const review = parseResult.data as HotelReview;

  // Check input review metadata matches if provided
  if (inputReview) {
    // Only validate if input has actual data (not placeholder)
    if (inputReview.hotelName !== 'Unknown Hotel') {
      if (review.hotelName.toLowerCase() !== inputReview.hotelName.toLowerCase()) {
        warnings.push(`Hotel name mismatch: expected "${inputReview.hotelName}", got "${review.hotelName}"`);
      }
    }
    
    if (inputReview.location !== 'Unknown') {
      const parsedLocation = review.location?.toLowerCase() || '';
      const inputLocation = inputReview.location.toLowerCase();
      if (!parsedLocation.includes(inputLocation) && !inputLocation.includes(parsedLocation)) {
        warnings.push(`Location mismatch: expected "${inputReview.location}", got "${review.location || 'none'}"`);
      }
    }
    
    if (inputReview.score > 0) {
      const scoreDiff = Math.abs(review.rating - inputReview.score);
      if (scoreDiff > 1) {
        warnings.push(`Rating mismatch: user score ${inputReview.score}, parsed rating ${review.rating} (diff: ${scoreDiff})`);
      }
    }
  }

  // Business logic validations
  
  // Check if hotel name is generic/missing
  if (review.hotelName.toLowerCase().includes('unknown') || 
      review.hotelName.toLowerCase().includes('hotel') && review.hotelName.split(' ').length === 1) {
    warnings.push('Hotel name appears generic or incomplete');
  }

  // Check sentiment alignment with rating
  if (review.sentiment === 'positive' && review.rating < 3) {
    warnings.push('Positive sentiment but low rating - possible mismatch');
  }
  if (review.sentiment === 'negative' && review.rating > 3) {
    warnings.push('Negative sentiment but high rating - possible mismatch');
  }

  // Check if highlights and issues align with sentiment
  if (review.sentiment === 'positive' && review.highlights.length === 0) {
    warnings.push('Positive sentiment but no highlights extracted');
  }
  if (review.sentiment === 'negative' && review.issues.length === 0) {
    warnings.push('Negative sentiment but no issues extracted');
  }

  // Check for contradictions
  if (review.highlights.length > 0 && review.issues.length > 0 && review.sentiment !== 'mixed') {
    warnings.push('Both highlights and issues present - sentiment might be better as "mixed"');
  }

  // Validate aspect ratings are present for detailed reviews
  const aspectsProvided = Object.values(review.aspects).filter(v => v !== undefined).length;
  if (aspectsProvided === 0 && review.summary.length > 100) {
    warnings.push('Detailed review but no aspect ratings extracted');
  }

  // Check summary quality
  if (review.summary.length < 10) {
    warnings.push('Summary is very short - might be incomplete');
  }
  if (review.summary.length > 500) {
    warnings.push('Summary is very long - should be more concise');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
