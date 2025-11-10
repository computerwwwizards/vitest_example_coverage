# Tasks: SonarQube Coverage Categorization Tool

## Context
Based on the refined problem definition and existing workspace structure, we need to build a tool that fetches coverage data from SonarQube Web API and generates categorized CSV reports.
## Task Breakdown

### 1. Core Infrastructure Setup
- [ ] **1.1** Create TypeScript library structure for the coverage reporter tool
  - Ensure `WORKSPACE` environment variable is set
  
    ```bash
    export WORKSPACE=$(pwd)
    ```
  
  - Run command to create library
  
    ```bash
    cd $WORKSPACE/packages && pnpm create rslib@latest --dir sonar-coverage-reporter --template "Node.js dual ESM/CJS package"
    ```
  
  - Select TypeScript and Vitest during setup
  - Add package to existing PNPM workspace configuration
  
    ```bash
    cd $WORKSPACE && echo "  - packages/sonar-coverage-reporter" >> pnpm-workspace.yaml
    ```

- [ ] **1.2** Design core interface architecture (frameworkless approach)
  - Define interface contracts and relationships using Mermaid diagrams
  - Plan dependency injection structure (constructor injection only)
  
  ```mermaid
  classDiagram
    class ProjectData {
        +string name
        +number coveragePercent
        +object metadata
        +Date lastAnalysis
    }
    
    class CoverageCategory {
        <<enumeration>>
        SIN_COVERAGE
        NO_PASA_MINIMO
        SI_PASA_MINIMO
    }
    
    class SonarQubeClient {
        <<interface>>
        +fetchProjects(filters: QueryFilter[]): Promise~ProjectData[]~
        +fetchCoverage(projectKey: string): Promise~number~
        +authenticate(token: string): Promise~void~
    }
    
    class FilterStrategy {
        <<interface>>
        +apply(projects: ProjectData[]): ProjectData[]
        +canHandle(filterType: string): boolean
    }
    
    class QueryFilter {
        <<interface>>
        +buildQuery(): object
        +getApiParams(): Record~string, any~
    }
    
    class CsvReporter {
        <<interface>>
        +generate(data: CategorizedProject[]): string
        +writeToFile(csv: string, path: string): Promise~void~
    }
    
    class CategorizedProject {
        +ProjectData project
        +CoverageCategory category
        +number threshold
    }
    
    class CoverageClassifier {
        <<interface>>
        +classify(coverage: number, threshold: number): CoverageCategory
    }
    
    class ReportOrchestrator {
        -SonarQubeClient client
        -FilterStrategy[] filters
        -CoverageClassifier classifier
        -CsvReporter reporter
        +constructor(client, filters, classifier, reporter)
        +generateReport(config: ReportConfig): Promise~string~
    }
    
    SonarQubeClient --> ProjectData
    FilterStrategy --> ProjectData
    CoverageClassifier --> CoverageCategory
    ReportOrchestrator --> SonarQubeClient
    ReportOrchestrator --> FilterStrategy
    ReportOrchestrator --> CoverageClassifier
    ReportOrchestrator --> CsvReporter
    CsvReporter --> CategorizedProject
    CategorizedProject --> ProjectData
    CategorizedProject --> CoverageCategory
  ```
  

### 2. Filtering System Implementation
- [ ] **2.1** Design filtering architecture
  - Implement Strategy pattern for different filter types
  - Create Builder pattern for filter configuration
  - Define common predicate interfaces

- [ ] **2.2** Implement query-level filtering strategies
  - Repository name pattern matching
  - Project key filtering
  - Date range filtering (last analysis)
  - Language-based filtering

- [ ] **2.3** Implement post-fetch filtering strategies  
  - Coverage threshold predicates
  - Repository metadata predicates
  - Custom business logic predicates
  - Combination filters (AND/OR logic)

### 3. Coverage Categorization Logic
- [ ] **4.1** Implement categorization engine
  - Create `CoverageClassifier` service
  - Implement Spanish category labels
  - Make threshold configurable (default 50%)
  - Handle edge cases (exactly 0%, missing data)

- [ ] **4.2** Add validation and error handling
  - Validate input thresholds
  - Handle malformed coverage data
  - Provide meaningful error messages

### 5. CSV Generation Pipeline
- [ ] **5.1** Implement CSV formatter with papaparse
  - Install `papaparse` dependency in the package
  
    ```bash
    cd $WORKSPACE/packages/sonar-coverage-reporter && pnpm add papaparse && pnpm add -D @types/papaparse
    ```
  
  - Create simple `CsvReporter` service using papaparse
  - Implement happy path for CSV generation (repository, coverage_percent, category columns)
  - Basic error handling only

- [ ] **5.2** Implement simple pipeline orchestration
  - Create main service that coordinates filtering → categorization → reporting
  - No streaming - process all data in memory
  - Simple synchronous flow

### 6. CLI Interface
- [ ] **6.1** Create simple command-line interface
  - Single command implementation (no CLI framework needed)
  - Basic argument parsing using `process.argv`
  - No configuration options for now (pending design)
  - Peding config file desing, add to readme to pedning tasks everything that we are posponing.


