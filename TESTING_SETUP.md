# Testing Setup Guide

This guide will help you set up UI testing for the XQ Fitness mobile app.

## Quick Start

### Option 1: Component Testing Only (Fastest)
```bash
npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native
```

### Option 2: Full Setup (Component + E2E)
```bash
# Component testing
npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native

# Maestro (E2E)
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Detailed Setup

### 1. Component Testing Setup

#### Install Dependencies

```bash
npm install --save-dev \
  jest \
  jest-expo \
  @testing-library/react-native \
  @testing-library/jest-native \
  @testing-library/react-hooks \
  react-test-renderer
```

#### Configure Jest

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.{js,jsx}',
    '**/*.test.{js,jsx}',
  ],
};
```

#### Update package.json

Add test scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### Create Test Utilities

Create `__tests__/utils/test-utils.js`:

```javascript
import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

// Helper to render components with navigation
export const renderWithNavigation = (component, options = {}) => {
  const Wrapper = ({ children }) => (
    <NavigationContainer>
      {children}
    </NavigationContainer>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

// Mock API responses
export const mockApiResponse = (data) => ({
  data,
  status: 200,
  statusText: 'OK',
});

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};
```

### 2. Maestro E2E Setup

#### Install Maestro

**Mac:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Or via Homebrew:
```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

**Linux:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Windows:**
Download from: https://maestro.mobile.dev/getting-started/installing-maestro

#### Verify Installation

```bash
maestro --version
```

#### Create Test Directory

```bash
mkdir -p e2e/flows
```

#### Create Maestro Config

Create `e2e/maestro.yaml`:

```yaml
# Maestro configuration
appId: host.exp.Exponent  # Expo Go app ID
includeTags: []
```

### 3. Example Tests

#### Component Test Example

Create `__tests__/screens/RoutineListScreen.test.js`:

```javascript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RoutineListScreen from '../../src/screens/RoutineListScreen';
import { mockNavigation, mockApiResponse } from '../utils/test-utils';
import * as api from '../../src/services/api';

// Mock API
jest.mock('../../src/services/api');

describe('RoutineListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    api.getRoutines.mockResolvedValue(mockApiResponse([]));
    
    const { getByTestId } = render(
      <RoutineListScreen navigation={mockNavigation} />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays routines list', async () => {
    const mockRoutines = [
      { id: 1, name: 'Push Pull Legs', isActive: true },
      { id: 2, name: 'Upper Lower', isActive: true },
    ];
    
    api.getRoutines.mockResolvedValue(mockApiResponse(mockRoutines));
    
    const { getByText, queryByTestId } = render(
      <RoutineListScreen navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByText('Push Pull Legs')).toBeTruthy();
      expect(getByText('Upper Lower')).toBeTruthy();
    });
  });

  it('navigates to create screen on button tap', async () => {
    api.getRoutines.mockResolvedValue(mockApiResponse([]));
    
    const { getByText } = render(
      <RoutineListScreen navigation={mockNavigation} />
    );
    
    await waitFor(() => {
      const createButton = getByText('Create Routine');
      fireEvent.press(createButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateRoutine');
    });
  });
});
```

#### Maestro E2E Test Example

Create `e2e/flows/create-routine.yaml`:

```yaml
appId: host.exp.Exponent
---
- launchApp
- assertVisible: "Routines"
- tapOn: "Create Routine"
- assertVisible: "Create New Routine"
- inputText: "Push Pull Legs"
- inputText: "3-day split routine"
- tapOn: "Save"
- assertVisible: "Push Pull Legs"
```

### 4. Running Tests

#### Component Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Specific test file
npm test RoutineListScreen
```

#### E2E Tests

```bash
# Run all flows
maestro test e2e/flows/

# Run specific flow
maestro test e2e/flows/create-routine.yaml

# Run with device
maestro test e2e/flows/ --device iPhone_14_Pro

# Run on Android
maestro test e2e/flows/ --device Pixel_5
```

### 5. CI/CD Integration

#### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Run E2E tests
        run: maestro test e2e/flows/
```

## Test Data Management

### Mock Data

Create `__tests__/fixtures/routines.js`:

```javascript
export const mockRoutines = [
  {
    id: 1,
    name: 'Push Pull Legs',
    description: '3-day split',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // ... more fixtures
];

export const mockMuscleGroups = [
  { id: 1, name: 'Chest' },
  { id: 2, name: 'Back' },
  // ... more fixtures
];
```

## Best Practices

1. **Test IDs**: Add `testID` props to components for reliable testing
2. **Mock APIs**: Always mock API calls in component tests
3. **Isolation**: Each test should be independent
4. **Naming**: Use descriptive test names
5. **Coverage**: Aim for 80%+ coverage on critical paths
6. **Maintenance**: Update tests when UI changes

## Troubleshooting

### Jest Issues

**Error: Cannot find module**
```bash
npm install --save-dev @babel/preset-env
```

**Error: Transform error**
- Check `transformIgnorePatterns` in jest.config.js
- Ensure all dependencies are properly configured

### Maestro Issues

**App not launching**
- Ensure Expo Go is installed
- Check app ID matches your Expo app
- Verify device/simulator is running

**Elements not found**
- Use `maestro studio` to inspect elements
- Add delays if needed: `- waitForAnimationToEnd`

## Next Steps

1. Set up Jest configuration
2. Write first component test
3. Install Maestro
4. Write first E2E flow
5. Add test IDs to components
6. Set up CI/CD

