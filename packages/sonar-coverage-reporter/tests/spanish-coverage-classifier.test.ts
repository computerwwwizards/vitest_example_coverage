import { expect, test, describe } from 'vitest';
import { SpanishCoverageClassifier } from '../src/implementations/spanish-coverage-classifier';
import { CoverageCategory } from '../src/types/project';

describe('SpanishCoverageClassifier', () => {
  const classifier = new SpanishCoverageClassifier();

  describe('classify method', () => {
    test('should classify 0% as Sin coverage', () => {
      const result = classifier.classify(0, 50);
      expect(result).toBe(CoverageCategory.SIN_COVERAGE);
    });

    test('should classify coverage below threshold as No pasa del mínimo esperado', () => {
      const result = classifier.classify(25, 50);
      expect(result).toBe(CoverageCategory.NO_PASA_MINIMO);
    });

    test('should classify coverage at threshold as Si pasa el mínimo esperado', () => {
      const result = classifier.classify(50, 50);
      expect(result).toBe(CoverageCategory.SI_PASA_MINIMO);
    });

    test('should classify coverage above threshold as Si pasa el mínimo esperado', () => {
      const result = classifier.classify(75, 50);
      expect(result).toBe(CoverageCategory.SI_PASA_MINIMO);
    });

    test('should handle edge case of 100% coverage', () => {
      const result = classifier.classify(100, 50);
      expect(result).toBe(CoverageCategory.SI_PASA_MINIMO);
    });
  });

  describe('validateCoverage method', () => {
    test('should accept valid coverage values', () => {
      expect(classifier.validateCoverage(0)).toBe(true);
      expect(classifier.validateCoverage(50.5)).toBe(true);
      expect(classifier.validateCoverage(100)).toBe(true);
    });

    test('should reject invalid coverage values', () => {
      expect(classifier.validateCoverage(-1)).toBe(false);
      expect(classifier.validateCoverage(101)).toBe(false);
      expect(classifier.validateCoverage(NaN)).toBe(false);
      expect(classifier.validateCoverage(Infinity)).toBe(false);
    });
  });

  describe('classifyDetailed method', () => {
    test('should return detailed classification result', () => {
      const result = classifier.classifyDetailed(75, { threshold: 50 });
      
      expect(result.category).toBe(CoverageCategory.SI_PASA_MINIMO);
      expect(result.threshold).toBe(50);
      expect(result.metadata?.originalCoverage).toBe(75);
    });
  });
});