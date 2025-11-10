/**
 * CSV reporting interfaces
 */

import type { CategorizedProject } from './project.js';

/**
 * Configuration for CSV generation
 */
export interface CsvConfig {
  /** Column headers (default: ['repository', 'coverage_percent', 'category']) */
  headers?: string[];
  /** CSV delimiter (default: ',') */
  delimiter?: string;
  /** Whether to include headers in output */
  includeHeaders?: boolean;
  /** Custom column mapping for different output formats */
  columnMapping?: Record<string, string>;
  /** Number formatting options */
  numberFormat?: {
    /** Number of decimal places for coverage */
    decimalPlaces?: number;
    /** Whether to include % symbol */
    includePercentSign?: boolean;
  };
}

/**
 * CSV generation result
 */
export interface CsvResult {
  /** Generated CSV content */
  content: string;
  /** Number of rows generated */
  rowCount: number;
  /** Generation metadata */
  metadata: {
    /** Timestamp of generation */
    generatedAt: Date;
    /** Configuration used */
    config: CsvConfig;
  };
}

/**
 * Interface for generating CSV reports from categorized project data
 */
export interface CsvReporter {
  /**
   * Generate CSV content from categorized projects
   * @param data - Array of categorized projects
   * @param config - Optional CSV configuration
   */
  generate(data: CategorizedProject[], config?: CsvConfig): string;

  /**
   * Generate detailed CSV result with metadata
   * @param data - Array of categorized projects
   * @param config - Optional CSV configuration
   */
  generateDetailed(data: CategorizedProject[], config?: CsvConfig): CsvResult;

  /**
   * Write CSV content to a file
   * @param csv - CSV content to write
   * @param path - File path to write to
   */
  writeToFile(csv: string, path: string): Promise<void>;

  /**
   * Validate that the data can be converted to CSV
   * @param data - Array of categorized projects to validate
   */
  validateData(data: CategorizedProject[]): boolean;
}

/**
 * Options for CSV file output
 */
export interface CsvOutputOptions {
  /** Output file path */
  filePath: string;
  /** Whether to overwrite existing file */
  overwrite?: boolean;
  /** File encoding (default: 'utf8') */
  encoding?: string;
}

/**
 * Custom formatter for CSV fields
 */
export interface CsvFieldFormatter {
  /** Format project name */
  formatProjectName?(name: string): string;
  /** Format coverage percentage */
  formatCoverage?(coverage: number): string;
  /** Format category label */
  formatCategory?(category: string): string;
}