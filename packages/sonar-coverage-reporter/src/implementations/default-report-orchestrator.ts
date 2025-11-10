/**
 * Report orchestrator implementation for coordinating the entire process
 */

import type {
  ReportOrchestrator,
  ReportOrchestratorFactory,
  ReportConfig,
  ReportResult,
  ProgressCallback,
  ReportError,
} from '../types/orchestrator.js';
import type { SonarQubeClient } from '../types/sonarqube.js';
import type { FilterStrategy } from '../types/filtering.js';
import type { CoverageClassifier } from '../types/classification.js';
import type { CsvReporter } from '../types/csv.js';
import type { ProjectData, CategorizedProject } from '../types/project.js';

/**
 * Main orchestrator implementation
 */
export class DefaultReportOrchestrator implements ReportOrchestrator {
  constructor(
    private client: SonarQubeClient,
    private filters: FilterStrategy[],
    private classifier: CoverageClassifier,
    private reporter: CsvReporter
  ) {}

  /**
   * Generate a complete coverage categorization report
   */
  async generateReport(
    config: ReportConfig,
    progressCallback?: ProgressCallback
  ): Promise<ReportResult> {
    const startTime = Date.now();

    try {
      // Validate configuration
      await this.validateConfig(config);

      // Step 1: Authenticate with SonarQube
      await this.client.authenticate(config.sonarqube.token);

      // Step 2: Fetch projects
      progressCallback?.onFetchingProjects?.();
      const projects = await this.client.fetchProjects([]); // Query filters would be applied at SonarQube level separately

      // Step 3: Apply filters
      const beforeCount = projects.length;
      const filteredProjects = this.applyFilters(projects);
      const afterCount = filteredProjects.length;
      progressCallback?.onFiltering?.(beforeCount, afterCount);

      // Step 4: Classify projects
      const categorizedProjects = this.classifyProjects(
        filteredProjects,
        config.classification,
        progressCallback
      );

      // Step 5: Generate CSV
      progressCallback?.onGeneratingCsv?.();
      const csvContent = this.reporter.generate(categorizedProjects, config.csv);

      // Step 6: Write to file if specified
      if (config.outputPath) {
        await this.reporter.writeToFile(csvContent, config.outputPath);
      }

      const result: ReportResult = {
        csvContent,
        projectCount: categorizedProjects.length,
        categoryCounts: this.calculateCategoryCounts(categorizedProjects),
        metadata: {
          generatedAt: new Date(),
          config,
          processingTime: Date.now() - startTime,
        },
      };

      progressCallback?.onComplete?.(result);
      return result;

    } catch (error) {
      throw this.wrapError(error, 'generate');
    }
  }

  /**
   * Validate the report configuration
   */
  async validateConfig(config: ReportConfig): Promise<boolean> {
    try {
      // Validate SonarQube config
      if (!config.sonarqube?.baseUrl) {
        throw new Error('SonarQube baseUrl is required');
      }

      if (!config.sonarqube?.token) {
        throw new Error('SonarQube token is required');
      }

      // Validate classification config
      if (config.classification?.threshold !== undefined) {
        if (config.classification.threshold < 0 || config.classification.threshold > 100) {
          throw new Error('Classification threshold must be between 0 and 100');
        }
      }

      // Basic URL validation
      try {
        new URL(config.sonarqube.baseUrl);
      } catch {
        throw new Error('Invalid SonarQube baseUrl format');
      }

      return true;
    } catch (error) {
      throw this.wrapError(error, 'config');
    }
  }

  /**
   * Get the dependencies used by this orchestrator
   */
  getDependencies() {
    return {
      client: this.client,
      filters: this.filters,
      classifier: this.classifier,
      reporter: this.reporter,
    };
  }

  /**
   * Apply all configured filters to projects
   */
  private applyFilters(projects: ProjectData[]): ProjectData[] {
    return this.filters.reduce(
      (filtered, filter) => filter.apply(filtered),
      projects
    );
  }

  /**
   * Classify all projects into coverage categories
   */
  private classifyProjects(
    projects: ProjectData[],
    classificationConfig: ReportConfig['classification'],
    progressCallback?: ProgressCallback
  ): CategorizedProject[] {
    return projects.map((project, index) => {
      const category = this.classifier.classify(
        project.coveragePercent,
        classificationConfig.threshold
      );

      const categorized: CategorizedProject = {
        project,
        category,
        threshold: classificationConfig.threshold,
      };

      progressCallback?.onProjectProcessed?.(categorized, index + 1, projects.length);
      return categorized;
    });
  }

  /**
   * Calculate counts for each category
   */
  private calculateCategoryCounts(projects: CategorizedProject[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const project of projects) {
      const category = project.category;
      counts[category] = (counts[category] || 0) + 1;
    }
    
    return counts;
  }

  /**
   * Wrap errors with appropriate phase information
   */
  private wrapError(error: unknown, phase: ReportError['phase']): ReportError {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const cause = error instanceof Error ? error : undefined;
    
    return {
      name: 'ReportError',
      message: `Error in ${phase} phase: ${message}`,
      phase,
      cause,
    } as ReportError;
  }
}

/**
 * Factory for creating orchestrator instances
 */
export class DefaultReportOrchestratorFactory implements ReportOrchestratorFactory {
  create(
    client: SonarQubeClient,
    filters: FilterStrategy[],
    classifier: CoverageClassifier,
    reporter: CsvReporter
  ): ReportOrchestrator {
    return new DefaultReportOrchestrator(client, filters, classifier, reporter);
  }

  /**
   * Create orchestrator with default implementations
   */
  static createWithDefaults(sonarqubeConfig: ReportConfig['sonarqube']): ReportOrchestrator {
    // Import implementations (these would normally be dependency-injected)
    const { FetchSonarQubeClient } = require('./fetch-sonarqube-client.js');
    const { SpanishCoverageClassifier } = require('./spanish-coverage-classifier.js');
    const { PapaparseCsvReporter } = require('./papaparse-csv-reporter.js');

    const client = new FetchSonarQubeClient(sonarqubeConfig);
    const classifier = new SpanishCoverageClassifier();
    const reporter = new PapaparseCsvReporter();
    const filters: FilterStrategy[] = [];

    return new DefaultReportOrchestrator(client, filters, classifier, reporter);
  }
}

/**
 * Utility functions for creating common configurations
 */
export class ReportConfigBuilder {
  private config: Partial<ReportConfig> = {};

  static create(): ReportConfigBuilder {
    return new ReportConfigBuilder();
  }

  sonarqube(sonarqubeConfig: ReportConfig['sonarqube']): ReportConfigBuilder {
    this.config.sonarqube = sonarqubeConfig;
    return this;
  }

  classification(classificationConfig: ReportConfig['classification']): ReportConfigBuilder {
    this.config.classification = classificationConfig;
    return this;
  }

  csv(csvConfig: ReportConfig['csv']): ReportConfigBuilder {
    this.config.csv = csvConfig;
    return this;
  }

  filters(filters: FilterStrategy[]): ReportConfigBuilder {
    this.config.filters = filters;
    return this;
  }

  outputPath(path: string): ReportConfigBuilder {
    this.config.outputPath = path;
    return this;
  }

  build(): ReportConfig {
    if (!this.config.sonarqube) {
      throw new Error('SonarQube configuration is required');
    }

    return {
      sonarqube: this.config.sonarqube,
      classification: this.config.classification || { threshold: 50 },
      csv: this.config.csv || {},
      filters: this.config.filters,
      outputPath: this.config.outputPath,
    };
  }
}