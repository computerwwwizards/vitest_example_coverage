/**
 * CSV Reporter implementation using papaparse
 */

import * as Papa from 'papaparse';
import { writeFile } from 'node:fs/promises';
import type {
  CsvReporter,
  CsvConfig,
  CsvResult,
} from '../types/csv.js';
import type { CategorizedProject } from '../types/project.js';

/**
 * Default CSV configuration
 */
const DEFAULT_CSV_CONFIG: Required<CsvConfig> = {
  headers: ['repository', 'coverage_percent', 'category'],
  delimiter: ',',
  includeHeaders: true,
  columnMapping: {},
  numberFormat: {
    decimalPlaces: 2,
    includePercentSign: false,
  },
};

/**
 * CSV Reporter implementation using papaparse for generation
 */
export class PapaparseCsvReporter implements CsvReporter {
  /**
   * Generate CSV content from categorized projects
   */
  generate(data: CategorizedProject[], config?: CsvConfig): string {
    const result = this.generateDetailed(data, config);
    return result.content;
  }

  /**
   * Generate detailed CSV result with metadata
   */
  generateDetailed(data: CategorizedProject[], config?: CsvConfig): CsvResult {
    const mergedConfig = { ...DEFAULT_CSV_CONFIG, ...config };
    
    if (!this.validateData(data)) {
      throw new Error('Invalid data provided for CSV generation');
    }

    const csvData = this.transformDataToCsvRows(data, mergedConfig);
    
    const csvContent = Papa.unparse(csvData, {
      delimiter: mergedConfig.delimiter,
      header: mergedConfig.includeHeaders,
      columns: mergedConfig.headers,
    });

    return {
      content: csvContent,
      rowCount: data.length,
      metadata: {
        generatedAt: new Date(),
        config: mergedConfig,
      },
    };
  }

  /**
   * Write CSV content to a file
   */
  async writeToFile(csv: string, path: string): Promise<void> {
    try {
      await writeFile(path, csv, { encoding: 'utf8' });
    } catch (error) {
      throw new Error(`Failed to write CSV file to ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that the data can be converted to CSV
   */
  validateData(data: CategorizedProject[]): boolean {
    if (!Array.isArray(data)) {
      return false;
    }

    if (data.length === 0) {
      return true; // Empty array is valid
    }

    return data.every(item => 
      item &&
      item.project &&
      typeof item.project.name === 'string' &&
      typeof item.project.coveragePercent === 'number' &&
      typeof item.category === 'string' &&
      typeof item.threshold === 'number'
    );
  }

  /**
   * Transform categorized projects to CSV row format
   */
  private transformDataToCsvRows(
    data: CategorizedProject[],
    config: Required<CsvConfig>
  ): Record<string, any>[] {
    return data.map(item => {
      const coverage = this.formatCoverage(item.project.coveragePercent, config.numberFormat);
      
      const row: Record<string, any> = {
        [config.headers[0]]: item.project.name,
        [config.headers[1]]: coverage,
        [config.headers[2]]: item.category,
      };

      // Apply column mapping if provided
      if (config.columnMapping && Object.keys(config.columnMapping).length > 0) {
        const mappedRow: Record<string, any> = {};
        for (const [originalKey, mappedKey] of Object.entries(config.columnMapping)) {
          if (row[originalKey] !== undefined) {
            mappedRow[mappedKey] = row[originalKey];
          }
        }
        return { ...row, ...mappedRow };
      }

      return row;
    });
  }

  /**
   * Format coverage percentage according to number format config
   */
  private formatCoverage(coverage: number, numberFormat: Required<CsvConfig>['numberFormat']): string {
    const formatted = coverage.toFixed(numberFormat.decimalPlaces);
    return numberFormat.includePercentSign ? `${formatted}%` : formatted;
  }
}