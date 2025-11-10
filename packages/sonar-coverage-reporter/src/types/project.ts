/**
 * Core data types for the SonarQube coverage reporter
 */

/**
 * Represents a project fetched from SonarQube
 */
export interface ProjectData {
  /** Project name */
  name: string;
  /** Project key (unique identifier in SonarQube) */
  key: string;
  /** Coverage percentage (0-100) */
  coveragePercent: number;
  /** Additional metadata from SonarQube */
  metadata: Record<string, any>;
  /** Date of last analysis */
  lastAnalysis: Date;
}

/**
 * Coverage categories in Spanish as per requirements
 */
export enum CoverageCategory {
  /** Coverage is exactly 0% or missing */
  SIN_COVERAGE = "Sin coverage",
  /** Coverage > 0% but below threshold */
  NO_PASA_MINIMO = "No pasa del mínimo esperado",
  /** Coverage >= threshold */
  SI_PASA_MINIMO = "Si pasa el mínimo esperado"
}

/**
 * Project with its calculated coverage category
 */
export interface CategorizedProject {
  /** Original project data */
  project: ProjectData;
  /** Assigned coverage category */
  category: CoverageCategory;
  /** Threshold used for categorization */
  threshold: number;
}