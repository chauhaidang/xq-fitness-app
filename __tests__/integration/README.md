# Integration Test Strategy with Contract-Based Mocking

## Overview

This directory contains integration tests that test complete screen behavior with real API integration. Tests use a contract-based mock server (Prism) that validates requests/responses against OpenAPI specs from the `/api` directory. This ensures tests verify actual API contracts while maintaining fast, isolated test execution.

## Key Concepts

### Contract-Based Testing

Integration tests use **Prism**, a contract-based mock server that:
- Validates request bodies against OpenAPI schemas
- Returns responses matching OpenAPI response schemas
- Rejects invalid requests (contract validation)
- Supports dynamic responses based on request parameters

### Difference from Unit Tests

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| **Location** | `__tests__/screens/*.test.js` | `__tests__/integration/*.integration.test.js` |
| **API Mocking** | `jest.mock('../../src/services/api')` | Real API calls to Prism server |
| **Contract Validation** | None | Validated against OpenAPI specs |
| **Speed** | Fast (< 1s per test) | Slower (~2-5s per test) |
| **Focus** | Component logic, UI interactions | End-to-end flows, API integration |
| **Dependencies** | Mocked | Real axios, real network calls |

## Prism Mock Server Setup

Prism runs two mock servers:

- **Read Service**: `http://localhost:4010` (mocks `api/read-service-api.yaml`)
- **Write Service**: `http://localhost:4011` (mocks `api/write-service-api.yaml`)

The mock servers are automatically started before all tests and stopped after all tests complete.

### Manual Server Control

To start the mock servers manually:

```bash
npm run mock:api
```

This starts both servers and keeps them running until you stop them (Ctrl+C).

## Running Tests

### Run All Integration Tests

```bash
npm run test:integration
```

### Run Integration Tests in Watch Mode

```bash
npm run test:integration:watch
```

### Run Only Unit Tests (Exclude Integration)

```bash
npm run test:unit
```

### Run All Tests (Unit + Integration)

```bash
npm run test:all
```

## Test Structure

### Test Files

Integration tests are located in `__tests__/integration/`:

- `RoutineListScreen.integration.test.js` - Tests routine list loading, display, and navigation
- `CreateRoutineScreen.integration.test.js` - Tests routine creation with API validation
- `EditRoutineScreen.integration.test.js` - Tests routine editing with API validation
- `RoutineDetailScreen.integration.test.js` - Tests routine detail loading and display
- `ManageWorkoutDayScreen.integration.test.js` - Tests workout day creation/editing

### Test Utilities

Located in `__tests__/integration/helpers/`:

- `test-utils.js` - Integration test utilities:
  - `renderScreenWithApi()` - Renders screen with real API calls
  - `waitForApiCall()` - Waits for API call to complete
  - `waitForLoadingToFinish()` - Waits for loading state to disappear
  - `resetApiServer()` - Resets server state (placeholder for future use)

- `api-server.js` - Prism server management:
  - `startPrismServers()` - Starts both mock servers
  - `stopPrismServers()` - Stops both mock servers
  - `configureMockServerUrls()` - Configures app to use mock URLs

### Test Fixtures

Located in `__tests__/integration/fixtures/`:

- `routines.json` - Sample routine data matching OpenAPI schema
- `workoutDays.json` - Sample workout day data
- `muscleGroups.json` - Sample muscle group data

## How It Works

### 1. Test Setup

Before all tests run:
1. Prism servers are started on ports 4010 (read) and 4011 (write)
2. Expo config is overridden to use mock server URLs
3. Tests wait for servers to be ready

### 2. Test Execution

During each test:
1. Screen is rendered with real API service (not mocked)
2. API calls go to Prism mock servers
3. Prism validates requests against OpenAPI contracts
4. Prism returns responses matching OpenAPI schemas
5. Tests verify UI updates based on API responses

### 3. Test Teardown

After all tests:
1. Prism servers are stopped
2. Test environment is cleaned up

## Writing New Integration Tests

### Basic Test Structure

```javascript
import { renderScreenWithApi, waitForApiCall } from './helpers/test-utils';
import MyScreen from '../../src/screens/MyScreen';

describe('MyScreen Integration Tests', () => {
  it('loads data from API', async () => {
    const { getByTestId, queryByTestId } = renderScreenWithApi(MyScreen);
    
    // Wait for loading to finish
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    // Wait for API call to complete
    await waitForApiCall(() => {
      const data = queryByTestId('data-element');
      return data !== null;
    });
    
    // Verify UI updated correctly
    expect(getByTestId('data-element')).toBeTruthy();
  });
});
```

### Key Points

1. **Use `renderScreenWithApi()`** instead of regular `render()` - this ensures API calls go to Prism
2. **Wait for API calls** - Use `waitForApiCall()` or `waitForLoadingToFinish()` to wait for async operations
3. **No manual mocking** - Don't use `jest.mock()` for API calls, let them go to Prism
4. **Test contracts** - Prism automatically validates requests/responses against OpenAPI specs

### Testing API Contracts

Prism automatically validates:
- Request method (GET, POST, PUT, DELETE)
- Request path parameters
- Request query parameters
- Request body schema (structure, required fields, data types)
- Response status codes
- Response body schema

**What Happens with Incorrect Payloads:**

Prism runs with the `--errors` flag enabled, which means:

1. **Invalid Request Body**: If the request body doesn't match the OpenAPI schema:
   - Prism returns HTTP **422 Unprocessable Entity** or **400 Bad Request**
   - Response includes detailed validation error messages
   - Example: Missing required field `numberOfSets` → 422 error with details

2. **Invalid Query Parameters**: If query parameters are missing or invalid:
   - Prism returns HTTP **400 Bad Request**
   - Example: Missing `workoutDayId` when required → 400 error

3. **Invalid Path Parameters**: If path parameters don't match the spec:
   - Prism returns HTTP **404 Not Found** or **400 Bad Request**
   - Example: Invalid `setId` format → 400 error

4. **Wrong HTTP Method**: If using wrong method (e.g., POST instead of PUT):
   - Prism returns HTTP **405 Method Not Allowed**

**In Your Tests:**
- If Prism validation fails, your app receives an error response
- Tests should verify that error handling works correctly
- Successful tests confirm the request matched the OpenAPI contract

## Important Notes

### API Path Configuration

The API service constructs URLs with service prefixes:
- Read: `${GATEWAY_URL}/xq-fitness-read-service/api/v1`
- Write: `${GATEWAY_URL}/xq-fitness-write-service/api/v1`

However, the OpenAPI specs define server URLs as:
- Read: `http://localhost:8080/api/v1`
- Write: `http://localhost:3000/api/v1`

For integration tests to work correctly, you may need to:
1. Update the OpenAPI spec `servers` URLs to match the service paths, OR
2. Configure Prism to serve at the correct paths using `--base-path` option, OR
3. Create a test-specific API service configuration

Currently, Prism serves the OpenAPI spec as-is, so paths must match between the spec and the API service calls.

## Troubleshooting

### Prism Servers Won't Start

1. Check if ports 4010 and 4011 are already in use:
   ```bash
   lsof -i :4010
   lsof -i :4011
   ```

2. Kill any processes using those ports:
   ```bash
   kill -9 <PID>
   ```

3. Ensure Prism is installed:
   ```bash
   npm install
   ```

### Tests Timeout

1. Increase timeout in `jest.integration.config.js`:
   ```javascript
   testTimeout: 30000, // Increase if needed
   ```

2. Check if Prism servers are running:
   ```bash
   curl http://localhost:4010/health
   ```

### API Calls Fail

1. Verify Expo config is being overridden correctly
2. Check that API service is using the correct base URLs
3. Ensure OpenAPI specs match the actual API structure

### Contract Validation Errors

If Prism rejects requests:
1. Check the OpenAPI spec in `/api/` directory
2. Verify request body matches the schema
3. Check request headers and parameters

## Benefits

1. **Contract Validation**: Ensures app code matches API contracts
2. **Real Integration**: Tests actual axios calls, not mocks
3. **Fast Feedback**: Faster than E2E tests, slower than unit tests
4. **API Changes Detection**: Fails if API contract changes
5. **Complete Flows**: Tests full screen behavior from API call to UI update

## Limitations

1. **No State Persistence**: Prism doesn't maintain state between requests by default
2. **Example Data**: Prism returns example data from OpenAPI specs, not custom test data
3. **Network Simulation**: Doesn't simulate network delays or failures (can be configured)

## Future Enhancements

- Add Prism dynamic response configuration for custom test data
- Add state management for Prism to simulate database-like behavior
- Add network delay simulation for testing loading states
- Add error scenario testing with Prism error responses

