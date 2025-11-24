import { HotelReviewSchema, type HotelReview } from './schema';
import type { Review } from './types';

export type ValidationErrorType = 
  | 'SCHEMA_VALIDATION_FAILED';

export type ValidationWarningType =
  | 'HOTEL_NAME_MISMATCH'
  | 'LOCATION_MISMATCH'
  | 'RATING_MISMATCH'
  | 'HOTEL_NAME_GENERIC'
  | 'SENTIMENT_RATING_MISMATCH_POSITIVE_LOW'
  | 'SENTIMENT_RATING_MISMATCH_NEGATIVE_HIGH'
  | 'SENTIMENT_MISSING_HIGHLIGHTS'
  | 'SENTIMENT_MISSING_ISSUES'
  | 'SENTIMENT_SHOULD_BE_MIXED'
  | 'MISSING_ASPECT_RATINGS'
  | 'SUMMARY_TOO_SHORT'
  | 'SUMMARY_TOO_LONG';

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationWarning {
  type: ValidationWarningType;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export function validateHotelReview(data: unknown, inputReview?: Review): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Schema validation using Zod
  const parseResult = HotelReviewSchema.safeParse(data);
  
  if (!parseResult.success) {
    errors.push({
      type: 'SCHEMA_VALIDATION_FAILED',
      message: 'Schema validation failed',
      details: {
        issues: parseResult.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      }
    });
    return { isValid: false, errors, warnings };
  }

  const review = parseResult.data as HotelReview;

  // Check input review metadata matches if provided
  if (inputReview) {
    // Only validate if input has actual data (not placeholder)
    if (inputReview.hotelName !== 'Unknown Hotel') {
      if (review.hotelName.toLowerCase() !== inputReview.hotelName.toLowerCase()) {
        warnings.push({
          type: 'HOTEL_NAME_MISMATCH',
          message: `Hotel name mismatch: expected "${inputReview.hotelName}", got "${review.hotelName}"`,
          details: { expected: inputReview.hotelName, actual: review.hotelName }
        });
      }
    }
    
    if (inputReview.location !== 'Unknown') {
      const parsedLocation = review.location?.toLowerCase() || '';
      const inputLocation = inputReview.location.toLowerCase();
      if (!parsedLocation.includes(inputLocation) && !inputLocation.includes(parsedLocation)) {
        warnings.push({
          type: 'LOCATION_MISMATCH',
          message: `Location mismatch: expected "${inputReview.location}", got "${review.location || 'none'}"`,
          details: { expected: inputReview.location, actual: review.location || 'none' }
        });
      }
    }
    
    if (inputReview.score > 0) {
      const scoreDiff = Math.abs(review.rating - inputReview.score);
      if (scoreDiff > 1) {
        warnings.push({
          type: 'RATING_MISMATCH',
          message: `Rating mismatch: user score ${inputReview.score}, parsed rating ${review.rating}`,
          details: { expected: inputReview.score, actual: review.rating, diff: scoreDiff }
        });
      }
    }
  }

  // Business logic validations
  
  // Check if hotel name is generic/missing
  if (review.hotelName.toLowerCase().includes('unknown') || 
      review.hotelName.toLowerCase().includes('hotel') && review.hotelName.split(' ').length === 1) {
    warnings.push({
      type: 'HOTEL_NAME_GENERIC',
      message: 'Hotel name appears generic or incomplete',
      details: { hotelName: review.hotelName }
    });
  }

  // Check sentiment alignment with rating
  if (review.sentiment === 'positive' && review.rating < 3) {
    warnings.push({
      type: 'SENTIMENT_RATING_MISMATCH_POSITIVE_LOW',
      message: 'Positive sentiment but low rating',
      details: { sentiment: review.sentiment, rating: review.rating }
    });
  }
  if (review.sentiment === 'negative' && review.rating > 3) {
    warnings.push({
      type: 'SENTIMENT_RATING_MISMATCH_NEGATIVE_HIGH',
      message: 'Negative sentiment but high rating',
      details: { sentiment: review.sentiment, rating: review.rating }
    });
  }

  // Check if highlights and issues align with sentiment
  if (review.sentiment === 'positive' && review.highlights.length === 0) {
    warnings.push({
      type: 'SENTIMENT_MISSING_HIGHLIGHTS',
      message: 'Positive sentiment but no highlights extracted',
      details: { sentiment: review.sentiment }
    });
  }
  if (review.sentiment === 'negative' && review.issues.length === 0) {
    warnings.push({
      type: 'SENTIMENT_MISSING_ISSUES',
      message: 'Negative sentiment but no issues extracted',
      details: { sentiment: review.sentiment }
    });
  }

  // Check for contradictions
  if (review.highlights.length > 0 && review.issues.length > 0 && review.sentiment !== 'mixed') {
    warnings.push({
      type: 'SENTIMENT_SHOULD_BE_MIXED',
      message: 'Both highlights and issues present - sentiment should be "mixed"',
      details: { 
        sentiment: review.sentiment, 
        highlightsCount: review.highlights.length, 
        issuesCount: review.issues.length 
      }
    });
  }

  // Validate aspect ratings are present for detailed reviews
  const aspectsProvided = Object.values(review.aspects).filter(v => v !== undefined).length;
  if (aspectsProvided === 0 && review.summary.length > 100) {
    warnings.push({
      type: 'MISSING_ASPECT_RATINGS',
      message: 'Detailed review but no aspect ratings extracted',
      details: { summaryLength: review.summary.length }
    });
  }

  // Check summary quality
  if (review.summary.length < 10) {
    warnings.push({
      type: 'SUMMARY_TOO_SHORT',
      message: 'Summary is very short',
      details: { length: review.summary.length }
    });
  }
  if (review.summary.length > 500) {
    warnings.push({
      type: 'SUMMARY_TOO_LONG',
      message: 'Summary is very long',
      details: { length: review.summary.length }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
