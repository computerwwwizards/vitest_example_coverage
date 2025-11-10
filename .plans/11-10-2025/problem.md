# Problem: Centralized Coverage Categorization

We have several (mainly frontend) repositories already analyzed in SonarQube. We need a single CSV report listing each repository's current coverage percentage and assigning one of three categories based on a configurable threshold.

Categories (Spanish labels):
1. "Sin coverage" – coverage is exactly 0% or missing.
2. "No pasa del mínimo esperado" – coverage > 0% but below threshold.
3. "Si pasa el mínimo esperado" – coverage >= threshold.

Input (at runtime): SonarQube server URL, access token, and a minimum coverage threshold (default 50%).
Output: CSV with columns: `repository,coverage_percent,category`.

See `generator-reporter.md` for full plan and decisions.