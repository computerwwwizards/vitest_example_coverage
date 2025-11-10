#!/usr/bin/env node

/**
 * CLI interface for SonarQube Coverage Reporter
 */

import { DefaultReportOrchestratorFactory, ReportConfigBuilder } from './implementations/default-report-orchestrator.js';
import type { ReportConfig, ProgressCallback, ReportResult } from './types/orchestrator.js';
import type { CategorizedProject } from './types/project.js';

interface CliArgs {
  sonarUrl: string;
  sonarToken: string;
  threshold: number;
  output?: string;
  help?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(argv: string[]): CliArgs {
  const args: Partial<CliArgs> = {};
  
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];
    
    switch (arg) {
      case '--sonar-url':
      case '-u':
        if (!nextArg || nextArg.startsWith('-')) {
          throw new Error('SonarQube URL is required');
        }
        args.sonarUrl = nextArg;
        i++;
        break;
        
      case '--sonar-token':
      case '-t':
        if (!nextArg || nextArg.startsWith('-')) {
          throw new Error('SonarQube token is required');
        }
        args.sonarToken = nextArg;
        i++;
        break;
        
      case '--threshold':
      case '-T':
        if (!nextArg || nextArg.startsWith('-')) {
          throw new Error('Threshold value is required');
        }
        const threshold = parseFloat(nextArg);
        if (isNaN(threshold) || threshold < 0 || threshold > 100) {
          throw new Error('Threshold must be a number between 0 and 100');
        }
        args.threshold = threshold;
        i++;
        break;
        
      case '--output':
      case '-o':
        if (!nextArg || nextArg.startsWith('-')) {
          throw new Error('Output file path is required');
        }
        args.output = nextArg;
        i++;
        break;
        
      case '--help':
      case '-h':
        args.help = true;
        break;
        
      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        }
        break;
    }
  }
  
  return {
    sonarUrl: args.sonarUrl || '',
    sonarToken: args.sonarToken || '',
    threshold: args.threshold || 50,
    output: args.output,
    help: args.help,
  };
}

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
SonarQube Coverage Reporter

Usage: sonar-coverage-reporter [options]

Options:
  -u, --sonar-url <url>       SonarQube server URL (required)
  -t, --sonar-token <token>   SonarQube authentication token (required)
  -T, --threshold <number>    Coverage threshold percentage (default: 50)
  -o, --output <file>         Output CSV file path (optional, prints to stdout if not specified)
  -h, --help                  Show this help message

Examples:
  sonar-coverage-reporter -u https://sonar.example.com -t mytoken123
  sonar-coverage-reporter -u https://sonar.example.com -t mytoken123 -T 75 -o report.csv

Coverage Categories:
  - "Sin coverage": 0% coverage or missing
  - "No pasa del mínimo esperado": > 0% but below threshold  
  - "Si pasa el mínimo esperado": >= threshold

Environment Variables:
  SONAR_URL     SonarQube server URL (can replace --sonar-url)
  SONAR_TOKEN   SonarQube token (can replace --sonar-token)
  `);
}

/**
 * Create progress callback for CLI output
 */
function createProgressCallback(): ProgressCallback {
  return {
    onFetchingProjects: () => {
      console.error('🔄 Fetching projects from SonarQube...');
    },
    onFiltering: (before: number, after: number) => {
      console.error(`🔍 Applied filters: ${before} → ${after} projects`);
    },
    onProjectProcessed: (project: CategorizedProject, index: number, total: number) => {
      if (index % 10 === 0 || index === total) {
        console.error(`📊 Processing projects: ${index}/${total}`);
      }
    },
    onGeneratingCsv: () => {
      console.error('📄 Generating CSV report...');
    },
    onComplete: (result: ReportResult) => {
      console.error(`✅ Report generated successfully!`);
      console.error(`   Projects processed: ${result.projectCount}`);
      console.error(`   Categories:`);
      for (const [category, count] of Object.entries(result.categoryCounts)) {
        console.error(`     ${category}: ${count}`);
      }
      console.error(`   Processing time: ${result.metadata.processingTime}ms`);
    },
  };
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv);
    
    if (args.help) {
      showHelp();
      return;
    }
    
    // Get configuration from args or environment
    const sonarUrl = args.sonarUrl || process.env.SONAR_URL;
    const sonarToken = args.sonarToken || process.env.SONAR_TOKEN;
    
    if (!sonarUrl) {
      throw new Error('SonarQube URL is required. Use --sonar-url or set SONAR_URL environment variable.');
    }
    
    if (!sonarToken) {
      throw new Error('SonarQube token is required. Use --sonar-token or set SONAR_TOKEN environment variable.');
    }
    
    // Build configuration
    const configBuilder = ReportConfigBuilder
      .create()
      .sonarqube({
        baseUrl: sonarUrl,
        token: sonarToken,
        timeout: 30000,
      })
      .classification({
        threshold: args.threshold,
        strictZeroClassification: true,
      })
      .csv({
        headers: ['repository', 'coverage_percent', 'category'],
        includeHeaders: true,
        numberFormat: {
          decimalPlaces: 2,
          includePercentSign: false,
        },
      });
    
    if (args.output) {
      configBuilder.outputPath(args.output);
    }
    
    const config: ReportConfig = configBuilder.build();
    
    // Create orchestrator and generate report
    const factory = new DefaultReportOrchestratorFactory();
    const orchestrator = factory.create(
      // These would normally be dependency-injected
      {} as any, // client
      [], // filters  
      {} as any, // classifier
      {} as any  // reporter
    );
    
    console.error('🚀 Starting SonarQube coverage report generation...');
    
    const result = await orchestrator.generateReport(config, createProgressCallback());
    
    // Output CSV content
    if (args.output) {
      console.error(`💾 Report saved to: ${args.output}`);
    } else {
      console.log(result.csvContent);
    }
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Handle unhandled rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Run the CLI
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}