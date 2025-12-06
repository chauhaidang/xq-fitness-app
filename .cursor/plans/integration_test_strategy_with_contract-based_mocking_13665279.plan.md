---
name: Integration Test Strategy with Contract-Based Mocking
overview: Add integration tests that test full screen behavior with real API integration using a contract-based mock server that validates requests/responses against OpenAPI specs. Tests will live in a separate __tests__/integration/ directory and focus on end-to-end screen flows without heavy mocking.
todos: []
---

# Integration Test Strategy with Contract-Based Mocking

## Overview

Add integration tests that test complete screen behavior with real API integration. Use a contract-based mock server (Prism) that validates requests/responses against OpenAPI specs from the `/api` directory. This ensures tests verify actual API contracts while maintaining fast, isolated test execution.

## Current State

- **Unit Tests**: Located in `__tests__/screens/`, heavily mock API calls using `jest.mock()`
- **API Contracts**: OpenAPI 3.0 specs in `api/read-service-api.yaml` and `api/write-service-api.yaml`
- **Screens**: 5 screens (RoutineListScreen, RoutineDetailScreen, CreateRoutineScreen, EditRoutineScreen, ManageWorkoutDayScreen)
- **API Service**: `src/services/api.js` uses axios with base URLs from Expo config

## Implementation Plan

### 1. Install Contract-Based Mock Server

- Add `@stoplight/prism-cli` to `devDependencies` in [package.json](package.json)
- Prism will validate requests/responses against OpenAPI specs
- Add `prism` script to start mock server: `prism mock api/read-service-api.yaml api/write-service-api.yaml`

### 2. Create Integration Test Infrastructure

- Create `__tests__/integration/` directory
- Create `__tests__/integration/setup.js`:
  - Start Prism mock server before all tests
  - Configure Expo config to use mock server URLs (`http://localhost:4010` for read, `http://localhost:4011` for write)
  - Stop server after all tests
- Create `__tests__/integration/helpers/api-server.js`:
  - Helper to start/stop Prism server
  - Helper to configure app to use mock server URLs
  - Helper to reset server state between tests

### 3. Create Integration Test Utilities

- Create `__tests__/integration/helpers/test-utils.js`:
  - `renderScreenWithApi()` - Renders screen with real API calls (not mocked)
  - `waitForApiCall()` - Waits for API call to complete
  - `mockApiResponse()` - Sets up Prism server response (if needed for specific scenarios)
  - `resetApiServer()` - Resets server state

### 4. Create Integration Tests for Each Screen

Create integration test files in `__tests__/integration/`:

#### 4.1 `RoutineListScreen.integration.test.js`

- Test loading routines from API
- Test displaying routines list
- Test empty state
- Test pull-to-refresh
- Test navigation to create/edit screens
- Test delete routine flow (with confirmation)
- **No mocking** - uses real API calls to Prism server

#### 4.2 `CreateRoutineScreen.integration.test.js`

- Test form rendering
- Test form validation
- Test successful routine creation (API call)
- Test error handling (invalid request, server error)
- Test navigation after success
- **No mocking** - validates request body matches OpenAPI contract

#### 4.3 `EditRoutineScreen.integration.test.js`

- Test loading existing routine data
- Test form pre-population
- Test updating routine (API call)
- Test error handling
- Test navigation after update
- **No mocking** - uses real GET and PUT API calls

#### 4.4 `RoutineDetailScreen.integration.test.js`

- Test loading routine details with workout days
- Test displaying routine information
- Test navigation to manage workout day
- Test delete routine flow
- Test error states (404, network error)
- **No mocking** - uses real API calls

#### 4.5 `ManageWorkoutDayScreen.integration.test.js`

- Test creating workout day (API call)
- Test editing workout day
- Test adding sets configuration
- Test deleting workout day
- Test form validation
- **No mocking** - validates all API contracts

### 5. Update Jest Configuration

- Update [jest.config.js](jest.config.js):
  - Add separate test match pattern for integration tests: `**/__tests__/integration/**/*.integration.test.js`
  - Configure longer timeout for integration tests (30s)
  - Add global setup/teardown for Prism server lifecycle
- Create `jest.integration.config.js`:
  - Separate config for integration tests
  - Different timeout and setup files

### 6. Update Package.json Scripts

- Add scripts to [package.json](package.json):
  - `test:integration` - Run integration tests
  - `test:integration:watch` - Watch mode for integration tests
  - `test:unit` - Run only unit tests (exclude integration)
  - `test:all` - Run both unit and integration tests
  - `mock:api` - Start Prism mock server manually

### 7. Create Test Data Fixtures

- Create `__tests__/integration/fixtures/`:
  - `routines.json` - Sample routine data matching OpenAPI schema
  - `workoutDays.json` - Sample workout day data
  - `muscleGroups.json` - Sample muscle group data
  - Use these to seed Prism server responses

### 8. Document Integration Test Strategy

- Create `__tests__/integration/README.md`:
  - Explain contract-based testing approach
  - Document how Prism validates against OpenAPI specs
  - Explain difference between unit and integration tests
  - Document how to add new integration tests
  - Troubleshooting guide

## Key Differences from Unit Tests

| Aspect | Unit Tests | Integration Tests |

|--------|-----------|-------------------|

| **Location** | `__tests__/screens/*.test.js` | `__tests__/integration/*.integration.test.js` |

| **API Mocking** | `jest.mock('../../src/services/api')` | Real API calls to Prism server |

| **Contract Validation** | None | Validated against OpenAPI specs |

| **Speed** | Fast (< 1s per test) | Slower (~2-5s per test) |

| **Focus** | Component logic, UI interactions | End-to-end flows, API integration |

| **Dependencies** | Mocked | Real axios, real network calls |

## Files to Create

- `__tests__/integration/setup.js` - Prism server lifecycle
- `__tests__/integration/helpers/api-server.js` - Prism server helpers
- `__tests__/integration/helpers/test-utils.js` - Integration test utilities
- `__tests__/integration/RoutineListScreen.integration.test.js`
- `__tests__/integration/CreateRoutineScreen.integration.test.js`
- `__tests__/integration/EditRoutineScreen.integration.test.js`
- `__tests__/integration/RoutineDetailScreen.integration.test.js`
- `__tests__/integration/ManageWorkoutDayScreen.integration.test.js`
- `__tests__/integration/fixtures/routines.json`
- `__tests__/integration/fixtures/workoutDays.json`
- `__tests__/integration/fixtures/muscleGroups.json`
- `__tests__/integration/README.md`
- `jest.integration.config.js`

## Files to Modify

- [package.json](package.json) - Add Prism dependency and test scripts
- [jest.config.js](jest.config.js) - Update test patterns, add integration test config

## Technical Details

### Prism Mock Server Setup

Prism will run on:

- Read Service: `http://localhost:4010` (mocks `api/read-service-api.yaml`)
- Write Service: `http://localhost:4011` (mocks `api/write-service-api.yaml`)

The mock server will:

- Validate request bodies against OpenAPI schemas
- Return responses matching OpenAPI response schemas
- Reject invalid requests (contract validation)
- Support dynamic responses based on request parameters

### Expo Config Override

Integration tests will override `app.config.js` gateway URL to point to Prism servers:

```javascript
Constants.expoConfig.extra.gatewayUrl = 'http://localhost:4010';
```

### Test Isolation

Each test will:

1. Reset Prism server state (clear any stored data)
2. Set up required test data via Prism's dynamic response feature
3. Execute test with real API calls
4. Verify responses match expected OpenAPI schemas

## Benefits

1. **Contract Validation**: Ensures app code matches API contracts
2. **Real Integration**: Tests actual axios calls, not mocks
3. **Fast Feedback**: Faster than E2E tests, slower than unit tests
4. **API Changes Detection**: Fails if API contract changes
5. **Complete Flows**: Tests full screen behavior from API call to UI update