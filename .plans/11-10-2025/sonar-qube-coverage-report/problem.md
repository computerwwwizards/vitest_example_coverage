# Problem: Centralized Coverage Categorization and Reporting

## Core Problem
We need to fetch coverage data from SonarQube's Web API for a filtered set of repositories and generate a categorized CSV report. This is a generic repository analysis tool that can be configured for different filtering strategies.

## Requirements

### Data Source
- HTTP fetch from SonarQube Web API
- Retrieve coverage metrics for specified projects
- Handle authentication via access tokens

### Repository Filtering
- Generic repository filtering (not limited to frontend projects)
- Configurable filtering strategies using Builder + Strategy pattern
- Options for:
  - Query-level filtering (API parameters)
  - Post-fetch predicate filtering (application-level)
  - Combination of both approaches

### Coverage Categorization
Categories (Spanish labels):
1. "Sin coverage" – coverage is exactly 0% or missing
2. "No pasa del mínimo esperado" – coverage > 0% but below threshold
3. "Si pasa el mínimo esperado" – coverage >= threshold

### Input/Output
- **Input**: SonarQube server URL, access token, minimum coverage threshold (default 50%), filtering criteria
- **Output**: CSV with columns: `repository,coverage_percent,category`

## Architecture Highlights

### SonarQube Client
- Dependency Injection for SonarQube fetch client
- Purpose-built client for our specific needs (not a full SonarQube SDK)
- Extensible design for future SonarQube integration needs

### Filtering Strategy
- Strategy pattern for different filtering approaches
- Builder pattern for configuring filter combinations
- Flexible predicate system for post-fetch filtering

### CSV Generation
- Separate pipeline step (not tightly coupled to data fetching)
- Transform/pipe approach for data processing
- Configurable output formatting

### Design Principles
- Single responsibility for each component
- Extensible without major refactoring
- Clear separation between data fetching, filtering, and reporting
