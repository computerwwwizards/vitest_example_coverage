/**
 * Filtering system interfaces using Strategy pattern
 */

import type { ProjectData } from './project.js';

/**
 * Predicate function type for filtering projects
 */
export type ProjectPredicate = (project: ProjectData) => boolean;

/**
 * Strategy interface for different filtering approaches
 */
export interface FilterStrategy {
  /**
   * Apply the filter to an array of projects
   * @param projects - Array of projects to filter
   */
  apply(projects: ProjectData[]): ProjectData[];

  /**
   * Check if this strategy can handle the given filter type
   * @param filterType - The type of filter to check
   */
  canHandle(filterType: string): boolean;

  /**
   * Get the name/identifier of this filter strategy
   */
  getName(): string;
}

/**
 * Configuration for building filters
 */
export interface FilterConfig {
  /** Type of filter (e.g., 'coverage', 'name', 'date') */
  type: string;
  /** Filter parameters */
  params: Record<string, any>;
  /** Whether to apply this filter at query level (true) or post-fetch (false) */
  applyAtQuery?: boolean;
}

/**
 * Builder interface for constructing filter combinations
 */
export interface FilterBuilder {
  /**
   * Add a filter strategy to the builder
   * @param strategy - The filter strategy to add
   */
  addStrategy(strategy: FilterStrategy): FilterBuilder;

  /**
   * Add a predicate filter
   * @param predicate - The predicate function to add
   */
  addPredicate(predicate: ProjectPredicate): FilterBuilder;

  /**
   * Combine filters with AND logic
   * @param filters - Array of filters to combine
   */
  and(filters: FilterStrategy[]): FilterBuilder;

  /**
   * Combine filters with OR logic
   * @param filters - Array of filters to combine
   */
  or(filters: FilterStrategy[]): FilterBuilder;

  /**
   * Build the final combined filter strategy
   */
  build(): FilterStrategy;
}

/**
 * Specific filter types for common use cases
 */
export interface CoverageFilter {
  /** Minimum coverage threshold */
  minCoverage?: number;
  /** Maximum coverage threshold */
  maxCoverage?: number;
}

export interface NamePatternFilter {
  /** Regex pattern for project name matching */
  pattern: string;
  /** Whether the pattern is case-sensitive */
  caseSensitive?: boolean;
}

export interface DateRangeFilter {
  /** Start date for filtering */
  startDate?: Date;
  /** End date for filtering */
  endDate?: Date;
}

export interface LanguageFilter {
  /** Array of language keys to include */
  languages: string[];
}