---
name: mobile-integration-tests
description: Workflow for implementing, running, and debugging mobile integration tests. Use this skill when working on `__tests__/integration` or when integration tests fail.
---

# Mobile Integration Tests

Mobile integration tests make **real API calls** to the gateway and require the backend (read service, write service, gateway) to be running.

## Principles

- **Real API calls**: No mocks or stubs for API services. Tests call the actual gateway URL.
- **Contract Adherence**: Request and response payloads must match the API contracts (`api/read-service-api.yaml`, `api/write-service-api.yaml`).
- **Location**: `__tests__/integration/`.
- **Naming**: `*.integration.test.js`.
- **Utilities**: Use `renderScreenWithApi`, `waitForApiCall`, `waitForLoadingToFinish`, `createTestRoutine` from `__tests__/integration/helpers/test-utils.js`.

## Workflow

### 1. Spin up Environment
From `mobile/` directory:

```bash
xq-infra generate -f ./test-env
xq-infra up
```

### 2. Run Tests
From `mobile/` directory:

```bash
yarn test:integration
```

To watch:
```bash
yarn test:integration:watch
```

### 3. Tear Down
```bash
xq-infra down
```

## Configuration

- **Jest Config**: `jest.integration.config.js`
- **Gateway**: Defaults to `http://localhost:8080`. Override with `GATEWAY_URL`.
- **Workers**: Tests run with `maxWorkers: 1` to avoid state conflicts in the real DB.

## Troubleshooting

- **"Address already in use"**: Check for other running `xq-infra` instances or containers on ports 5432/8080.
- **Test Failures**: Check `xq-infra logs` to see backend errors. Ensure data seeded by tests matches what the backend expects.
