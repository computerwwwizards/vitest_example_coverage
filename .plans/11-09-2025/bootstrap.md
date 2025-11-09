Check [agents.md](../../agents.md) for context

## Implementation Tasks - Bootstrap 11/09/2025

### Phase 1: Workspace Setup

1. **Initialize workspace dependencies**
   ```bash
   pnpm add -w vitest @vitest/coverage-v8 typescript @types/node -D
   ```

2. **Create workspace-level Vitest configuration**
   - File: `vitest.config.ts` (not vitest.workspace.ts)
   - Purpose: Orchestrate tests across all applications using projects
   - Configuration: Projects array pointing to tested apps

### Phase 2: Test-Enabled Applications (App A & App B)

#### Requirements per application:
- **Location**: `apps/app-a/` and `apps/app-b/`
- **Structure**: Two TypeScript source files per app
- **Test Coverage**: Exactly 50% (test only one of two source files)
- **Test Framework**: Vitest with coverage instrumentation

#### Implementation steps:
1. **Create application structure and initialize packages**
   ```bash
   mkdir -p apps/app-a/src
   mkdir -p apps/app-b/src
   cd apps/app-a && pnpm init
   cd ../app-b && pnpm init
   cd ../..
   ```

2. **Generate TypeScript source files**
   - `src/calculator.ts` (tested file)
   - `src/utils.ts` (untested file)

3. **Create test files**
   - `calculator.test.ts` (at same level as src/, covers only calculator.ts)

4. **Setup individual Vitest configurations**
   - File: `vitest.config.ts` in each app directory
   - Enable coverage reporting
   - Configure test patterns
   - Use `defineProject` instead of `defineConfig` for better type safety

5. **Install dependencies per app**
   ```bash
   cd apps/app-a && pnpm add vitest @vitest/coverage-v8 typescript -D
   cd ../app-b && pnpm add vitest @vitest/coverage-v8 typescript -D
   ```

### Phase 3: Control Application (App C)

#### Requirements:
- **Location**: `apps/app-c/`
- **Purpose**: Control group to validate behavior with untested code
- **Configuration**: No tests, no Vitest dependency

#### Implementation:
1. **Create structure and initialize package**
   ```bash
   mkdir -p apps/app-c/src
   cd apps/app-c && pnpm init
   cd ../..
   ```

2. **Generate source files**
   - `src/service.ts`
   - `src/helpers.ts`

3. **Package configuration**
   - Basic `package.json` without test dependencies
   - No Vitest configuration

### Phase 4: Workspace Test Orchestration

#### Workspace Root Configuration:

1. **Update workspace package.json with test scripts**
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:coverage": "vitest run --coverage",
       "test:watch": "vitest",
       "test:ui": "vitest --ui"
     }
   }
   ```

2. **Create workspace Vitest configuration**
   ```bash
   touch vitest.config.ts
   ```

3. **Configure coverage aggregation using projects**
   - Root config with projects array: `projects: ['apps/*']`
   - Coverage format: LCOV
   - Output directory: `./coverage/`
   - Aggregate reports from tested applications only

### Phase 5: Validation Commands

#### Pre-implementation validation:
```bash
# Verify workspace structure
find apps/ -type f -name "*.ts" -o -name "*.json" | tree --fromfile

# Check pnpm workspace recognition
pnpm list -r
```

#### Post-implementation validation:
```bash
# Run tests across workspace
pnpm test

# Generate coverage report
pnpm test:coverage

# Verify coverage files
ls -la coverage/
cat coverage/lcov.info

# Check individual app coverage
find apps/ -name "coverage" -type d
```

#### Coverage verification:
```bash
# Validate 50% coverage per tested app
pnpm test:coverage --reporter=verbose

```bash
# Check App C doesn't break the process
pnpm test --project="app-a" --project="app-b"
```
```

### Expected Artifacts

#### 1. Directory Structure
```
workspace/
├── vitest.config.ts             # Workspace test orchestration
├── package.json                 # Root package with test scripts
├── coverage/
│   └── lcov.info               # Aggregated coverage report
└── apps/
    ├── app-a/
    │   ├── package.json        # With vitest dependency
    │   ├── vitest.config.ts    # Individual test config
    │   ├── calculator.test.ts  # Test file at root level
    │   └── src/
    │       ├── calculator.ts   # TESTED (covered)
    │       └── utils.ts        # UNTESTED (uncovered)
    ├── app-b/
    │   ├── package.json        # With vitest dependency
    │   ├── vitest.config.ts    # Individual test config
    │   ├── calculator.test.ts  # Test file at root level
    │   └── src/
    │       ├── calculator.ts   # TESTED (covered)
    │       └── utils.ts        # UNTESTED (uncovered)
    └── app-c/
        ├── package.json        # NO vitest dependency
        └── src/
            ├── service.ts      # UNTESTED
            └── helpers.ts      # UNTESTED
```

#### 2. Coverage Metrics Validation
- **App A**: 50% coverage (1/2 files tested)
- **App B**: 50% coverage (1/2 files tested)  
- **App C**: 0% coverage (excluded from test run)
- **Workspace**: Aggregated LCOV report combining App A & B

#### 3. Final Deliverables
- ✅ Portable LCOV coverage report
- ✅ Workspace-level test orchestration
- ✅ Individual app test isolation
- ✅ Control group validation (App C)

### Success Criteria Commands
```bash
# 1. Workspace test execution
pnpm test && echo "✅ Workspace tests pass"

# 2. Coverage report generation  
pnpm test:coverage && test -f coverage/lcov.info && echo "✅ LCOV report generated"

# 3. Coverage percentage validation
grep -c "SF:" coverage/lcov.info | test $(cat) -eq 4 && echo "✅ Expected files covered"

# 4. App C isolation test
ls apps/app-c/ | grep -v "test\|vitest" && echo "✅ App C has no test infrastructure"
```
