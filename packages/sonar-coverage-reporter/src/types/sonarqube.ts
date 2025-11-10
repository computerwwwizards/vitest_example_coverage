/**
 * SonarQube Web API client interfaces
 */

import type { ProjectData } from './project.js';

/**
 * Interface for building SonarQube API query filters
 */
export interface QueryFilter {
  /** Build the query object for SonarQube API */
  buildQuery(): Record<string, any>;
  /** Get API parameters for the request */
  getApiParams(): Record<string, any>;
}

/**
 * Configuration for SonarQube authentication and connection
 */
export interface SonarQubeConfig {
  /** SonarQube server base URL */
  baseUrl: string;
  /** Authentication token */
  token: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
}

/**
 * SonarQube client interface for fetching projects and coverage data
 */
export interface SonarQubeClient {
  /** 
   * Authenticate with SonarQube server
   * @param token - Authentication token
   */
  authenticate(token: string): Promise<void>;

  /**
   * Fetch projects based on query filters
   * @param filters - Array of query filters to apply
   */
  fetchProjects(filters: QueryFilter[]): Promise<ProjectData[]>;

  /**
   * Fetch coverage data for a specific project
   * @param projectKey - The SonarQube project key
   */
  fetchCoverage(projectKey: string): Promise<number>;

  /**
   * Fetch project metadata
   * @param projectKey - The SonarQube project key
   */
  fetchProjectMetadata(projectKey: string): Promise<Record<string, any>>;
}