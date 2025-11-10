import { expect, test, describe } from 'vitest';
import { PapaparseCsvReporter } from '../src/implementations/papaparse-csv-reporter';
import { CoverageCategory } from '../src/types/project';
import type { CategorizedProject } from '../src/types/project';

describe('PapaparseCsvReporter', () => {
  const reporter = new PapaparseCsvReporter();

  const sampleData: CategorizedProject[] = [
    {
      project: {
        name: 'project-a',
        key: 'project-a',
        coveragePercent: 75.5,
        metadata: {},
        lastAnalysis: new Date('2024-01-01'),
      },
      category: CoverageCategory.SI_PASA_MINIMO,
      threshold: 50,
    },
    {
      project: {
        name: 'project-b', 
        key: 'project-b',
        coveragePercent: 25.0,
        metadata: {},
        lastAnalysis: new Date('2024-01-02'),
      },
      category: CoverageCategory.NO_PASA_MINIMO,
      threshold: 50,
    },
    {
      project: {
        name: 'project-c',
        key: 'project-c',
        coveragePercent: 0,
        metadata: {},
        lastAnalysis: new Date('2024-01-03'),
      },
      category: CoverageCategory.SIN_COVERAGE,
      threshold: 50,
    },
  ];

  describe('generate method', () => {
    test('should generate CSV with default configuration', () => {
      const csv = reporter.generate(sampleData);
      
      expect(csv).toContain('repository,coverage_percent,category');
      expect(csv).toContain('project-a,75.50,Si pasa el mínimo esperado');
      expect(csv).toContain('project-b,25.00,No pasa del mínimo esperado');
      expect(csv).toContain('project-c,0.00,Sin coverage');
    });

    test('should respect custom configuration', () => {
      const csv = reporter.generate(sampleData, {
        headers: ['name', 'coverage', 'status'],
        delimiter: ';',
        numberFormat: {
          decimalPlaces: 1,
          includePercentSign: true,
        },
      });
      
      expect(csv).toContain('name;coverage;status');
      expect(csv).toContain('project-a;75.5%;Si pasa el mínimo esperado');
    });

    test('should handle empty data', () => {
      const csv = reporter.generate([]);
      expect(csv).toBe(''); // papaparse returns empty string for empty array
    });
  });

  describe('validateData method', () => {
    test('should validate correct data structure', () => {
      expect(reporter.validateData(sampleData)).toBe(true);
    });

    test('should reject invalid data', () => {
      expect(reporter.validateData(null as any)).toBe(false);
      expect(reporter.validateData('not-array' as any)).toBe(false);
      
      const invalidProject = {
        project: {
          name: 'test',
          // missing required fields
        },
        category: CoverageCategory.SIN_COVERAGE,
        threshold: 50,
      } as any;
      
      expect(reporter.validateData([invalidProject])).toBe(false);
    });

    test('should accept empty array', () => {
      expect(reporter.validateData([])).toBe(true);
    });
  });

  describe('generateDetailed method', () => {
    test('should return detailed result with metadata', () => {
      const result = reporter.generateDetailed(sampleData);
      
      expect(result.content).toContain('repository,coverage_percent,category');
      expect(result.rowCount).toBe(3);
      expect(result.metadata.generatedAt).toBeInstanceOf(Date);
      expect(result.metadata.config).toBeDefined();
    });
  });
});