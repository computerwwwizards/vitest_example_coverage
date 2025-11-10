import { expect, test } from 'vitest';
import { CoverageCategory, type ProjectData, type CategorizedProject } from '../src/index';

test('CoverageCategory enum values', () => {
  expect(CoverageCategory.SIN_COVERAGE).toBe('Sin coverage');
  expect(CoverageCategory.NO_PASA_MINIMO).toBe('No pasa del mínimo esperado');
  expect(CoverageCategory.SI_PASA_MINIMO).toBe('Si pasa el mínimo esperado');
});

test('ProjectData interface compilation', () => {
  // This test ensures our types compile correctly
  const project: ProjectData = {
    name: 'test-project',
    key: 'test-key',
    coveragePercent: 75.5,
    metadata: { language: 'TypeScript' },
    lastAnalysis: new Date()
  };

  expect(project.name).toBe('test-project');
  expect(project.coveragePercent).toBe(75.5);
});

test('CategorizedProject interface compilation', () => {
  // This test ensures our types compile correctly
  const categorized: CategorizedProject = {
    project: {
      name: 'test-project',
      key: 'test-key',
      coveragePercent: 75.5,
      metadata: {},
      lastAnalysis: new Date()
    },
    category: CoverageCategory.SI_PASA_MINIMO,
    threshold: 50
  };

  expect(categorized.category).toBe(CoverageCategory.SI_PASA_MINIMO);
  expect(categorized.threshold).toBe(50);
});
