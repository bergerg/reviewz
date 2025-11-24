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
