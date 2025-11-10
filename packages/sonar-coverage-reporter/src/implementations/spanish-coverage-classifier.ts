/**
 * Coverage Classification Engine implementation
 */

import type {
  CoverageClassifier,
  ClassificationConfig,
  ClassificationResult,
  CoverageValidationResult,
} from '../types/classification.js';
import { CoverageCategory } from '../types/project.js';

/**
 * Default classification configuration
 */
const DEFAULT_CLASSIFICATION_CONFIG: Required<ClassificationConfig> = {
  threshold: 50,
  strictZeroClassification: true,
  customCategories: {},
};

/**
 * Coverage classifier implementation with Spanish categories
 */
export class SpanishCoverageClassifier implements CoverageClassifier {
  /**
   * Classify a coverage percentage into a category
   */
  classify(coverage: number, threshold: number): CoverageCategory {
    const validation = this.validateCoverageInternal(coverage);
    if (!validation.isValid) {
      throw new Error(`Invalid coverage value: ${validation.errorMessage}`);
    }

    const normalizedCoverage = validation.normalizedValue!;

    // Exactly 0% or missing coverage
    if (normalizedCoverage === 0) {
      return this.getZeroCoverageCategory();
    }

    // Above or equal to threshold
    if (normalizedCoverage >= threshold) {
      return CoverageCategory.SI_PASA_MINIMO;
    }

    // Between 0% and threshold
    return CoverageCategory.NO_PASA_MINIMO;
  }

  /**
   * Classify with detailed result
   */
  classifyDetailed(coverage: number, config: ClassificationConfig): ClassificationResult {
    const mergedConfig = { ...DEFAULT_CLASSIFICATION_CONFIG, ...config };
    
    const category = this.classify(coverage, mergedConfig.threshold);
    
    return {
      category,
      threshold: mergedConfig.threshold,
      metadata: {
        originalCoverage: coverage,
        strictZeroClassification: mergedConfig.strictZeroClassification,
        configUsed: mergedConfig,
      },
    };
  }

  /**
   * Validate that a coverage value is within acceptable range
   */
  validateCoverage(coverage: number): boolean {
    const result = this.validateCoverageInternal(coverage);
    return result.isValid;
  }

  /**
   * Get the category for exactly 0% coverage
   */
  getZeroCoverageCategory(): CoverageCategory {
    return CoverageCategory.SIN_COVERAGE;
  }

  /**
   * Internal validation with detailed result
   */
  private validateCoverageInternal(coverage: number): CoverageValidationResult {
    // Check if it's a number
    if (typeof coverage !== 'number') {
      return {
        isValid: false,
        errorMessage: 'Coverage must be a number',
      };
    }

    // Check for NaN
    if (Number.isNaN(coverage)) {
      return {
        isValid: false,
        errorMessage: 'Coverage cannot be NaN',
      };
    }

    // Check for infinity
    if (!Number.isFinite(coverage)) {
      return {
        isValid: false,
        errorMessage: 'Coverage must be a finite number',
      };
    }

    // Check range (0-100)
    if (coverage < 0) {
      return {
        isValid: false,
        errorMessage: 'Coverage cannot be negative',
      };
    }

    if (coverage > 100) {
      return {
        isValid: false,
        errorMessage: 'Coverage cannot exceed 100%',
      };
    }

    return {
      isValid: true,
      normalizedValue: coverage,
    };
  }

  /**
   * Static factory method for creating classifier with default config
   */
  static withDefaults(): SpanishCoverageClassifier {
    return new SpanishCoverageClassifier();
  }

  /**
   * Utility method to get all category values
   */
  static getAllCategories(): CoverageCategory[] {
    return Object.values(CoverageCategory);
  }
}