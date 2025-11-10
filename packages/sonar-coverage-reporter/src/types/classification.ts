/**
 * Coverage categorization interfaces
 */

import type { CoverageCategory } from './project.js';

/**
 * Configuration for coverage classification
 */
export interface ClassificationConfig {
  /** Coverage threshold percentage (default: 50) */
  threshold: number;
  /** Whether to treat exactly 0% as "Sin coverage" */
  strictZeroClassification?: boolean;
  /** Custom category mappings if needed */
  customCategories?: Record<string, CoverageCategory>;
}

/**
 * Result of coverage classification
 */
export interface ClassificationResult {
  /** The assigned category */
  category: CoverageCategory;
  /** The threshold used for classification */
  threshold: number;
  /** Additional metadata about the classification */
  metadata?: Record<string, any>;
}

/**
 * Interface for classifying project coverage into categories
 */
export interface CoverageClassifier {
  /**
   * Classify a coverage percentage into a category
   * @param coverage - Coverage percentage (0-100)
   * @param threshold - Minimum acceptable coverage threshold
   */
  classify(coverage: number, threshold: number): CoverageCategory;

  /**
   * Classify with detailed result
   * @param coverage - Coverage percentage (0-100)
   * @param config - Classification configuration
   */
  classifyDetailed(coverage: number, config: ClassificationConfig): ClassificationResult;

  /**
   * Validate that a coverage value is within acceptable range
   * @param coverage - Coverage percentage to validate
   */
  validateCoverage(coverage: number): boolean;

  /**
   * Get the category for exactly 0% coverage
   */
  getZeroCoverageCategory(): CoverageCategory;
}

/**
 * Validation result for coverage data
 */
export interface CoverageValidationResult {
  /** Whether the coverage value is valid */
  isValid: boolean;
  /** Error message if validation failed */
  errorMessage?: string;
  /** Normalized coverage value (if valid) */
  normalizedValue?: number;
}