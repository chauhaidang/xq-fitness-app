const {
  startPrismServers,
  stopPrismServers,
  configureMockServerUrls,
} = require('./helpers/api-server');

// Configure mock server URLs first
const mockUrls = configureMockServerUrls();

// Mock expo-constants to use mock server URLs
// This must be done before any modules that import expo-constants
jest.mock('expo-constants', () => {
  const actualConstants = jest.requireActual('expo-constants');
  const originalExpoConfig = actualConstants.default?.expoConfig || {};
  
  return {
    ...actualConstants,
    default: {
      ...actualConstants.default,
      expoConfig: {
        ...originalExpoConfig,
        extra: {
          ...originalExpoConfig?.extra,
          gatewayUrl: mockUrls.gatewayUrl,
        },
      },
    },
  };
});

// Start Prism servers before all tests
beforeAll(async () => {
  console.log('Starting Prism mock servers...');
  await startPrismServers();
  console.log('Prism mock servers started');
  
  // Wait a bit for servers to be fully ready
  await new Promise(resolve => setTimeout(resolve, 2000));
}, 30000);

// Stop Prism servers after all tests
afterAll(async () => {
  console.log('Stopping Prism mock servers...');
  await stopPrismServers();
  console.log('Prism mock servers stopped');
}, 10000);

// Reset server state between tests
beforeEach(async () => {
  // Prism doesn't maintain state, but we can clear any cached responses
  // This is a placeholder for any future state management
});

