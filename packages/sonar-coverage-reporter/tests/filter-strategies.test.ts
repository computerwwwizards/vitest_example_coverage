import { expect, test, describe } from 'vitest';
import {
  CoverageFilterStrategy,
  NamePatternFilterStrategy,
  ProjectFilterBuilder,
} from '../src/implementations/filter-strategies';
import type { ProjectData } from '../src/types/project';

describe('Filter Strategies', () => {
  const sampleProjects: ProjectData[] = [
    {
      name: 'frontend-app',
      key: 'frontend-app',
      coveragePercent: 85.0,
      metadata: { language: 'TypeScript' },
      lastAnalysis: new Date('2024-01-01'),
    },
    {
      name: 'backend-service',
      key: 'backend-service', 
      coveragePercent: 45.5,
      metadata: { language: 'Java' },
      lastAnalysis: new Date('2024-01-02'),
    },
    {
      name: 'mobile-app',
      key: 'mobile-app',
      coveragePercent: 0,
      metadata: { language: 'Swift' },
      lastAnalysis: new Date('2024-01-03'),
    },
  ];

  describe('CoverageFilterStrategy', () => {
    test('should filter projects above minimum coverage', () => {
      const filter = new CoverageFilterStrategy({ minCoverage: 50 });
      const result = filter.apply(sampleProjects);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('frontend-app');
    });

    test('should filter projects below maximum coverage', () => {
      const filter = new CoverageFilterStrategy({ maxCoverage: 50 });
      const result = filter.apply(sampleProjects);
      
      expect(result).toHaveLength(2);
      expect(result.map(p => p.name)).toEqual(['backend-service', 'mobile-app']);
    });

    test('should filter projects in coverage range', () => {
      const filter = new CoverageFilterStrategy({ 
        minCoverage: 40, 
        maxCoverage: 90 
      });
      const result = filter.apply(sampleProjects);
      
      expect(result).toHaveLength(2);
      expect(result.map(p => p.name)).toEqual(['frontend-app', 'backend-service']);
    });
  });

  describe('NamePatternFilterStrategy', () => {
    test('should filter by name pattern (case sensitive)', () => {
      const filter = new NamePatternFilterStrategy({ 
        pattern: 'frontend.*',
        caseSensitive: true 
      });
      const result = filter.apply(sampleProjects);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('frontend-app');
    });

    test('should filter by name pattern (case insensitive)', () => {
      const filter = new NamePatternFilterStrategy({ 
        pattern: 'APP',
        caseSensitive: false 
      });
      const result = filter.apply(sampleProjects);
      
      expect(result).toHaveLength(2);
      expect(result.map(p => p.name)).toEqual(['frontend-app', 'mobile-app']);
    });
  });

  describe('ProjectFilterBuilder', () => {
    test('should create combined filters with builder pattern', () => {
      const filter = ProjectFilterBuilder
        .coverageAbove(40)
        .build();
      
      const result = filter.apply(sampleProjects);
      expect(result).toHaveLength(2);
    });

    test('should chain multiple filters', () => {
      const coverageFilter = new CoverageFilterStrategy({ minCoverage: 40 });
      const nameFilter = new NamePatternFilterStrategy({ pattern: '.*app', caseSensitive: false });
      
      const combined = new ProjectFilterBuilder()
        .addStrategy(coverageFilter)
        .addStrategy(nameFilter)
        .build();
      
      const result = combined.apply(sampleProjects);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('frontend-app');
    });

    test('should handle empty filter list', () => {
      const filter = new ProjectFilterBuilder().build();
      const result = filter.apply(sampleProjects);
      
      expect(result).toHaveLength(3);
    });
  });
});