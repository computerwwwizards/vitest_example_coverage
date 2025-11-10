/**
 * SonarQube Coverage Reporter
 * 
 * A tool for fetching coverage data from SonarQube Web API 
 * and generating categorized CSV reports.
 */

// Core types and interfaces
export type {
  ProjectData,
  CategorizedProject
} from './types/project.js';

export {
  CoverageCategory
} from './types/project.js';

// SonarQube client interfaces
export type {
  QueryFilter,
  SonarQubeConfig,
  SonarQubeClient
} from './types/sonarqube.js';

// Filtering system interfaces
export type {
  ProjectPredicate,
  FilterStrategy,
  FilterConfig,
  FilterBuilder,
  CoverageFilter,
  NamePatternFilter,
  DateRangeFilter,
  LanguageFilter
} from './types/filtering.js';

// Coverage classification interfaces
export type {
  ClassificationConfig,
  ClassificationResult,
  CoverageClassifier,
  CoverageValidationResult
} from './types/classification.js';

// CSV reporting interfaces
export type {
  CsvConfig,
  CsvResult,
  CsvReporter,
  CsvOutputOptions,
  CsvFieldFormatter
} from './types/csv.js';

// Orchestrator interfaces
export type {
  ReportConfig,
  ReportResult,
  ProgressCallback,
  ReportOrchestrator,
  ReportOrchestratorFactory
} from './types/orchestrator.js';

export {
  ReportError
} from './types/orchestrator.js';

// Re-export everything for convenience
export * from './types/project.js';
export * from './types/sonarqube.js';
export * from './types/filtering.js';
export * from './types/classification.js';
export * from './types/csv.js';
export * from './types/orchestrator.js';

// Export implementations
export * from './implementations/index.js';
