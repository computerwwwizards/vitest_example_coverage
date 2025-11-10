To check resources [Contitution](./constitution.md)

---

# coverage-reporter – Implementation Plan

Purpose:
Generate a CSV summarizing test coverage for selected frontend SonarQube projects, assigning each to one of three categories based on a configurable threshold.

Categories (Spanish):
1. “Sin coverage” – coverage exactly 0% or metric missing
2. “No pasa del mínimo esperado” – 0 < coverage < threshold
3. “Si pasa el mínimo esperado” – coverage ≥ threshold

Inputs (CLI flags or environment variables):
- SONAR_HOST_URL / --sonar-url (required)
- SONAR_TOKEN / --token (required; never logged)
- MIN_COVERAGE_THRESHOLD / --threshold (default 50)
- PROJECT_PREFIX / --project-prefix (optional)
- PROJECT_LIST_PATH / --project-list (optional, newline-separated keys)
- BRANCH / --branch (optional; only needed for non-default branch)
- METRIC_KEY / --metric-key (default: coverage)
- OUTPUT / --output (default: coverage_report_<YYYY-MM-DD>.csv)

Precedence: CLI flag overrides environment variable.

Project selection:
- If --project-list: use those keys.
- Else if --project-prefix: all projects whose key starts with prefix.
- Else: fail and request explicit scope.

Coverage metric:
- Default: coverage (line + condition coverage). Can override with --metric-key.

CSV output:
- Columns: repository,coverage_percent,category (comma, UTF-8, header row)
- repository = project key
- coverage_percent: up to two decimals
- Sorted alphabetically by repository

Categorization logic:
if coverage is null or 0 → “Sin coverage”
else if coverage < threshold → “No pasa del mínimo esperado”
else → “Si pasa el mínimo esperado”

Edge cases:
- Missing metric treated as 0
- API failures for some projects: log warning, include others, treat missing as 0

Dependencies:
- typescript (dev)
- tsx (dev)
- dotenv (runtime, if .env used)
- papaparse

Error handling & exit codes:
- 0: success
- 1: config/argument error
- 2: authentication (401/403)
- 3: fatal (network, malformed API)

Pagination & performance:
- Use /api/projects/search (page loop, page size 100)
- Fetch measures per project with concurrency (e.g. 8)

Security:
- Never print or log the token

Branch:
- By default, fetches coverage for the main branch.
- If --branch is provided, fetch coverage for that branch (optional parameter in API call).

Steps:
1. Scaffold workspace package: packages/coverage-reporter
2. Implement config parsing (for parsing use papaparse)
3. Discover projects
4. Fetch coverage measures
5. Categorize and write CSV
6. Add minimal unit test for categorization

