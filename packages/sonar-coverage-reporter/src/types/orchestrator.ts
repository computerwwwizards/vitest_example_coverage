/**
 * Report orchestration interfaces for coordinating the entire process
 */

import type { SonarQubeClient, SonarQubeConfig } from './sonarqube.js';
import type { FilterStrategy } from './filtering.js';
import type { CoverageClassifier, ClassificationConfig } from './classification.js';
import type { CsvReporter, CsvConfig } from './csv.js';
import type { CategorizedProject } from './project.js';

/**
 * Configuration for the complete report generation process
 */
export interface ReportConfig {
  /** SonarQube connection configuration */
  sonarqube: SonarQubeConfig;
  /** Coverage classification configuration */
  classification: ClassificationConfig;
  /** CSV output configuration */
  csv: CsvConfig;
  /** Array of filter strategies to apply */
  filters?: FilterStrategy[];
  /** Output file path for the CSV report */
  outputPath?: string;
}

/**
 * Result of the complete report generation process
 */
export interface ReportResult {
  /** Generated CSV content */
  csvContent: string;
  /** Number of projects processed */
  projectCount: number;
  /** Number of projects in each category */
  categoryCounts: Record<string, number>;
  /** Processing metadata */
  metadata: {
    /** When the report was generated */
    generatedAt: Date;
    /** Configuration used */
    config: ReportConfig;
    /** Processing duration in milliseconds */
    processingTime: number;
  };
}

/**
 * Progress callback for long-running operations
 */
export interface ProgressCallback {
  /** Called when fetching projects */
  onFetchingProjects?: () => void;
  /** Called when a project is processed */
  onProjectProcessed?: (project: CategorizedProject, index: number, total: number) => void;
  /** Called when filtering is applied */
  onFiltering?: (beforeCount: number, afterCount: number) => void;
  /** Called when generating CSV */
  onGeneratingCsv?: () => void;
  /** Called when the process is complete */
  onComplete?: (result: ReportResult) => void;
}

/**
 * Main orchestrator interface for coordinating the entire reporting process
 */
export interface ReportOrchestrator {
  /**
   * Generate a complete coverage categorization report
   * @param config - Report generation configuration
   * @param progressCallback - Optional progress callback
   */
  generateReport(config: ReportConfig, progressCallback?: ProgressCallback): Promise<ReportResult>;

  /**
   * Validate the report configuration
   * @param config - Configuration to validate
   */
  validateConfig(config: ReportConfig): Promise<boolean>;

  /**
   * Get the dependencies used by this orchestrator
   */
  getDependencies(): {
    client: SonarQubeClient;
    filters: FilterStrategy[];
    classifier: CoverageClassifier;
    reporter: CsvReporter;
  };
}

/**
 * Factory interface for creating orchestrator instances
 */
export interface ReportOrchestratorFactory {
  /**
   * Create a new orchestrator instance with dependencies
   * @param client - SonarQube client implementation
   * @param filters - Array of filter strategies
   * @param classifier - Coverage classifier implementation
   * @param reporter - CSV reporter implementation
   */
  create(
    client: SonarQubeClient,
    filters: FilterStrategy[],
    classifier: CoverageClassifier,
    reporter: CsvReporter
  ): ReportOrchestrator;
}

/**
 * Error types for orchestrator operations
 */
export class ReportError extends Error {
  constructor(
    message: string,
    public readonly phase: 'config' | 'fetch' | 'filter' | 'classify' | 'generate',
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ReportError';
  }
}