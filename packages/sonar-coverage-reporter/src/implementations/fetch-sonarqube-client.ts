/**
 * SonarQube Web API client implementation
 */

import type {
  SonarQubeClient,
  SonarQubeConfig,
  QueryFilter,
} from '../types/sonarqube.js';
import type { ProjectData } from '../types/project.js';

/**
 * HTTP client error for SonarQube API operations
 */
export class SonarQubeApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: any
  ) {
    super(message);
    this.name = 'SonarQubeApiError';
  }
}

/**
 * Query filter for project name patterns
 */
export class ProjectNameQueryFilter implements QueryFilter {
  constructor(private pattern: string) {}

  buildQuery(): Record<string, any> {
    return {
      q: this.pattern,
    };
  }

  getApiParams(): Record<string, any> {
    return this.buildQuery();
  }
}

/**
 * Query filter for project keys
 */
export class ProjectKeyQueryFilter implements QueryFilter {
  constructor(private keys: string[]) {}

  buildQuery(): Record<string, any> {
    return {
      projects: this.keys.join(','),
    };
  }

  getApiParams(): Record<string, any> {
    return this.buildQuery();
  }
}

/**
 * Query filter for analyzed date range
 */
export class AnalyzedDateQueryFilter implements QueryFilter {
  constructor(private from?: Date, private to?: Date) {}

  buildQuery(): Record<string, any> {
    const params: Record<string, any> = {};
    
    if (this.from) {
      params.analyzedBefore = this.formatDateForApi(this.to || new Date());
    }
    
    if (this.to) {
      params.analyzedBefore = this.formatDateForApi(this.to);
    }
    
    return params;
  }

  getApiParams(): Record<string, any> {
    return this.buildQuery();
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

/**
 * SonarQube Web API client implementation using fetch
 */
export class FetchSonarQubeClient implements SonarQubeClient {
  private authToken?: string;
  private baseHeaders: Record<string, string>;

  constructor(private config: SonarQubeConfig) {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Authenticate with SonarQube server
   */
  async authenticate(token: string): Promise<void> {
    this.authToken = token;
    this.baseHeaders = {
      ...this.baseHeaders,
      'Authorization': `Bearer ${token}`,
    };

    // Test authentication by making a simple API call
    try {
      const response = await this.makeRequest('/api/authentication/validate');
      if (!response.valid) {
        throw new SonarQubeApiError('Authentication validation failed');
      }
    } catch (error) {
      throw new SonarQubeApiError(
        'Failed to authenticate with SonarQube',
        undefined,
        error
      );
    }
  }

  /**
   * Fetch projects based on query filters
   */
  async fetchProjects(filters: QueryFilter[] = []): Promise<ProjectData[]> {
    const params = this.combineFilterParams(filters);
    
    try {
      const response = await this.makeRequest('/api/projects/search', {
        method: 'GET',
        params,
      });

      return this.transformProjectsResponse(response);
    } catch (error) {
      throw new SonarQubeApiError(
        'Failed to fetch projects from SonarQube',
        undefined,
        error
      );
    }
  }

  /**
   * Fetch coverage data for a specific project
   */
  async fetchCoverage(projectKey: string): Promise<number> {
    try {
      const response = await this.makeRequest('/api/measures/component', {
        method: 'GET',
        params: {
          component: projectKey,
          metricKeys: 'coverage',
        },
      });

      return this.extractCoverageFromMeasures(response);
    } catch (error) {
      throw new SonarQubeApiError(
        `Failed to fetch coverage for project ${projectKey}`,
        undefined,
        error
      );
    }
  }

  /**
   * Fetch project metadata
   */
  async fetchProjectMetadata(projectKey: string): Promise<Record<string, any>> {
    try {
      const [projectDetails, qualityGate] = await Promise.all([
        this.makeRequest(`/api/projects/show`, {
          method: 'GET',
          params: { project: projectKey },
        }),
        this.makeRequest(`/api/qualitygates/project_status`, {
          method: 'GET',
          params: { projectKey },
        }),
      ]);

      return {
        ...projectDetails.project,
        qualityGate: qualityGate.projectStatus,
      };
    } catch (error) {
      throw new SonarQubeApiError(
        `Failed to fetch metadata for project ${projectKey}`,
        undefined,
        error
      );
    }
  }

  /**
   * Make HTTP request to SonarQube API
   */
  private async makeRequest(
    endpoint: string,
    options: {
      method?: string;
      params?: Record<string, any>;
      body?: any;
    } = {}
  ): Promise<any> {
    const { method = 'GET', params, body } = options;
    
    let url = `${this.config.baseUrl}${endpoint}`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      url += `?${searchParams.toString()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 10000);

    try {
      const response = await fetch(url, {
        method,
        headers: this.baseHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new SonarQubeApiError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          errorText
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof SonarQubeApiError) {
        throw error;
      }
      
      throw new SonarQubeApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error
      );
    }
  }

  /**
   * Combine filter parameters from multiple query filters
   */
  private combineFilterParams(filters: QueryFilter[]): Record<string, any> {
    const combinedParams: Record<string, any> = {};
    
    for (const filter of filters) {
      const params = filter.getApiParams();
      Object.assign(combinedParams, params);
    }
    
    return combinedParams;
  }

  /**
   * Transform SonarQube projects API response to ProjectData[]
   */
  private async transformProjectsResponse(response: any): Promise<ProjectData[]> {
    if (!response.components || !Array.isArray(response.components)) {
      return [];
    }

    const projects: ProjectData[] = [];

    for (const component of response.components) {
      try {
        // Fetch coverage and metadata for each project
        const [coverage, metadata] = await Promise.all([
          this.fetchCoverage(component.key),
          this.fetchProjectMetadata(component.key),
        ]);

        projects.push({
          name: component.name,
          key: component.key,
          coveragePercent: coverage,
          metadata,
          lastAnalysis: new Date(component.lastAnalysisDate || Date.now()),
        });
      } catch (error) {
        // Log error but continue processing other projects
        console.warn(`Failed to fetch data for project ${component.key}:`, error);
        
        // Add project with minimal data
        projects.push({
          name: component.name,
          key: component.key,
          coveragePercent: 0,
          metadata: { error: 'Failed to fetch additional data' },
          lastAnalysis: new Date(component.lastAnalysisDate || Date.now()),
        });
      }
    }

    return projects;
  }

  /**
   * Extract coverage percentage from measures response
   */
  private extractCoverageFromMeasures(response: any): number {
    if (!response.component?.measures) {
      return 0;
    }

    const coverageMeasure = response.component.measures.find(
      (measure: any) => measure.metric === 'coverage'
    );

    if (!coverageMeasure?.value) {
      return 0;
    }

    return parseFloat(coverageMeasure.value);
  }
}