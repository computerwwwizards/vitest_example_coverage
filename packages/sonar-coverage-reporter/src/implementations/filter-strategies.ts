/**
 * Filtering system implementations using Strategy pattern
 */

import type {
  FilterStrategy,
  ProjectPredicate,
  FilterBuilder,
  CoverageFilter,
  NamePatternFilter,
  DateRangeFilter,
  LanguageFilter,
} from '../types/filtering.js';
import type { ProjectData } from '../types/project.js';

/**
 * Base filter strategy implementation
 */
abstract class BaseFilterStrategy implements FilterStrategy {
  abstract apply(projects: ProjectData[]): ProjectData[];
  abstract canHandle(filterType: string): boolean;
  abstract getName(): string;
}

/**
 * Coverage-based filter strategy
 */
export class CoverageFilterStrategy extends BaseFilterStrategy {
  constructor(private config: CoverageFilter) {
    super();
  }

  apply(projects: ProjectData[]): ProjectData[] {
    return projects.filter(project => {
      const coverage = project.coveragePercent;
      
      if (this.config.minCoverage !== undefined && coverage < this.config.minCoverage) {
        return false;
      }
      
      if (this.config.maxCoverage !== undefined && coverage > this.config.maxCoverage) {
        return false;
      }
      
      return true;
    });
  }

  canHandle(filterType: string): boolean {
    return filterType === 'coverage';
  }

  getName(): string {
    return 'CoverageFilter';
  }
}

/**
 * Name pattern filter strategy
 */
export class NamePatternFilterStrategy extends BaseFilterStrategy {
  private regex: RegExp;

  constructor(private config: NamePatternFilter) {
    super();
    const flags = config.caseSensitive === false ? 'i' : '';
    this.regex = new RegExp(config.pattern, flags);
  }

  apply(projects: ProjectData[]): ProjectData[] {
    return projects.filter(project => this.regex.test(project.name));
  }

  canHandle(filterType: string): boolean {
    return filterType === 'namePattern' || filterType === 'name';
  }

  getName(): string {
    return 'NamePatternFilter';
  }
}

/**
 * Date range filter strategy
 */
export class DateRangeFilterStrategy extends BaseFilterStrategy {
  constructor(private config: DateRangeFilter) {
    super();
  }

  apply(projects: ProjectData[]): ProjectData[] {
    return projects.filter(project => {
      const analysisDate = project.lastAnalysis;
      
      if (this.config.startDate && analysisDate < this.config.startDate) {
        return false;
      }
      
      if (this.config.endDate && analysisDate > this.config.endDate) {
        return false;
      }
      
      return true;
    });
  }

  canHandle(filterType: string): boolean {
    return filterType === 'dateRange' || filterType === 'date';
  }

  getName(): string {
    return 'DateRangeFilter';
  }
}

/**
 * Language filter strategy
 */
export class LanguageFilterStrategy extends BaseFilterStrategy {
  constructor(private config: LanguageFilter) {
    super();
  }

  apply(projects: ProjectData[]): ProjectData[] {
    return projects.filter(project => {
      const projectLanguages = this.extractLanguagesFromMetadata(project.metadata);
      return this.config.languages.some(lang => projectLanguages.includes(lang));
    });
  }

  canHandle(filterType: string): boolean {
    return filterType === 'language' || filterType === 'languages';
  }

  getName(): string {
    return 'LanguageFilter';
  }

  private extractLanguagesFromMetadata(metadata: Record<string, any>): string[] {
    // Try common language metadata fields
    if (metadata.languages && Array.isArray(metadata.languages)) {
      return metadata.languages;
    }
    
    if (metadata.language && typeof metadata.language === 'string') {
      return [metadata.language];
    }
    
    if (metadata.qualityGate?.languages) {
      return Array.isArray(metadata.qualityGate.languages) 
        ? metadata.qualityGate.languages 
        : [metadata.qualityGate.languages];
    }
    
    return [];
  }
}

/**
 * Predicate filter strategy for custom logic
 */
export class PredicateFilterStrategy extends BaseFilterStrategy {
  constructor(private predicate: ProjectPredicate, private name: string = 'PredicateFilter') {
    super();
  }

  apply(projects: ProjectData[]): ProjectData[] {
    return projects.filter(this.predicate);
  }

  canHandle(filterType: string): boolean {
    return filterType === 'predicate' || filterType === 'custom';
  }

  getName(): string {
    return this.name;
  }
}

/**
 * Combined filter strategy (AND logic)
 */
export class AndFilterStrategy extends BaseFilterStrategy {
  constructor(private strategies: FilterStrategy[]) {
    super();
  }

  apply(projects: ProjectData[]): ProjectData[] {
    return this.strategies.reduce(
      (filtered, strategy) => strategy.apply(filtered),
      projects
    );
  }

  canHandle(filterType: string): boolean {
    return filterType === 'and' || filterType === 'combined';
  }

  getName(): string {
    return `AndFilter(${this.strategies.map(s => s.getName()).join(', ')})`;
  }
}

/**
 * Combined filter strategy (OR logic)
 */
export class OrFilterStrategy extends BaseFilterStrategy {
  constructor(private strategies: FilterStrategy[]) {
    super();
  }

  apply(projects: ProjectData[]): ProjectData[] {
    if (this.strategies.length === 0) {
      return projects;
    }

    const results = new Set<ProjectData>();
    
    for (const strategy of this.strategies) {
      const filtered = strategy.apply(projects);
      filtered.forEach(project => results.add(project));
    }
    
    return Array.from(results);
  }

  canHandle(filterType: string): boolean {
    return filterType === 'or';
  }

  getName(): string {
    return `OrFilter(${this.strategies.map(s => s.getName()).join(', ')})`;
  }
}

/**
 * Filter builder implementation
 */
export class ProjectFilterBuilder implements FilterBuilder {
  private strategies: FilterStrategy[] = [];

  addStrategy(strategy: FilterStrategy): FilterBuilder {
    this.strategies.push(strategy);
    return this;
  }

  addPredicate(predicate: ProjectPredicate): FilterBuilder {
    this.strategies.push(new PredicateFilterStrategy(predicate));
    return this;
  }

  and(filters: FilterStrategy[]): FilterBuilder {
    this.strategies.push(new AndFilterStrategy(filters));
    return this;
  }

  or(filters: FilterStrategy[]): FilterBuilder {
    this.strategies.push(new OrFilterStrategy(filters));
    return this;
  }

  build(): FilterStrategy {
    if (this.strategies.length === 0) {
      return new PredicateFilterStrategy(() => true, 'NoOpFilter');
    }
    
    if (this.strategies.length === 1) {
      return this.strategies[0];
    }
    
    return new AndFilterStrategy(this.strategies);
  }

  /**
   * Static factory methods for common filters
   */
  static coverageAbove(threshold: number): FilterBuilder {
    return new ProjectFilterBuilder().addStrategy(
      new CoverageFilterStrategy({ minCoverage: threshold })
    );
  }

  static coverageBelow(threshold: number): FilterBuilder {
    return new ProjectFilterBuilder().addStrategy(
      new CoverageFilterStrategy({ maxCoverage: threshold })
    );
  }

  static nameMatches(pattern: string, caseSensitive = true): FilterBuilder {
    return new ProjectFilterBuilder().addStrategy(
      new NamePatternFilterStrategy({ pattern, caseSensitive })
    );
  }

  static analyzedAfter(date: Date): FilterBuilder {
    return new ProjectFilterBuilder().addStrategy(
      new DateRangeFilterStrategy({ startDate: date })
    );
  }

  static hasLanguages(languages: string[]): FilterBuilder {
    return new ProjectFilterBuilder().addStrategy(
      new LanguageFilterStrategy({ languages })
    );
  }
}