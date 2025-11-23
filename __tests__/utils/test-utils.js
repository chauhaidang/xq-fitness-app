import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

/**
 * Render component with NavigationContainer wrapper
 * Useful for testing screens that use navigation
 */
export const renderWithNavigation = (component, options = {}) => {
  const Wrapper = ({ children }) => (
    <NavigationContainer>
      {children}
    </NavigationContainer>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

/**
 * Mock navigation object for testing
 */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => true),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
};

/**
 * Mock route object for testing
 */
export const mockRoute = (params = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

/**
 * Mock API response helper
 */
export const mockApiResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

/**
 * Mock API error response
 */
export const mockApiError = (message = 'Network Error', status = 500) => {
  const error = new Error(message);
  error.response = {
    data: { message },
    status,
    statusText: 'Error',
  };
  return Promise.reject(error);
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

