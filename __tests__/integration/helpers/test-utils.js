import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Constants from 'expo-constants';
import {
  configureMockServerUrls,
  READ_SERVICE_URL,
  WRITE_SERVICE_URL,
} from './api-server';

// Override Expo config to use mock server URLs
const mockUrls = configureMockServerUrls();
if (Constants.expoConfig?.extra) {
  Constants.expoConfig.extra.gatewayUrl = mockUrls.gatewayUrl;
}

/**
 * Render a screen with real API calls (not mocked)
 * This is similar to the unit test renderScreen but ensures API calls
 * go to the Prism mock server
 * 
 * @param {React.Component} ScreenComponent - The screen component to render
 * @param {Object} options - Configuration options
 * @param {Object} options.routeParams - Route parameters to pass to the screen
 * @param {Object} options.navigationOptions - Additional navigation options
 * @param {Object} options.initialParams - Initial route params
 * @param {Object} options.renderOptions - Options to pass to the render function
 * 
 * @returns {Object} Object containing all render result properties plus navigation and route
 */
export const renderScreenWithApi = (ScreenComponent, options = {}) => {
  const {
    routeParams = {},
    navigationOptions = {},
    initialParams,
    renderOptions = {},
  } = options;

  const params = initialParams !== undefined ? initialParams : routeParams;

  const Stack = createStackNavigator();
  
  let capturedNavigation = null;
  let capturedRoute = null;
  let wrappedNavigation = null;

  const ScreenWrapper = (props) => {
    capturedNavigation = props.navigation;
    capturedRoute = props.route;
    
    if (!wrappedNavigation) {
      const originalNavigate = props.navigation.navigate;
      const originalGoBack = props.navigation.goBack;
      const originalSetOptions = props.navigation.setOptions;
      const originalDispatch = props.navigation.dispatch;
      const originalReset = props.navigation.reset;

      wrappedNavigation = {
        ...props.navigation,
        navigate: jest.fn((...args) => originalNavigate(...args)),
        goBack: jest.fn((...args) => originalGoBack(...args)),
        setOptions: jest.fn((...args) => originalSetOptions(...args)),
        dispatch: jest.fn((...args) => originalDispatch(...args)),
        reset: jest.fn((...args) => originalReset(...args)),
      };
    }
    
    return <ScreenComponent {...props} navigation={wrappedNavigation} />;
  };

  const TestNavigator = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="TestScreen">
          <Stack.Screen
            name="TestScreen"
            component={ScreenWrapper}
            initialParams={params}
            options={navigationOptions}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };

  const renderResult = render(<TestNavigator />, renderOptions);

  return {
    ...renderResult,
    navigation: wrappedNavigation || capturedNavigation,
    route: capturedRoute || { key: 'test-route', name: 'TestScreen', params },
  };
};

/**
 * Wait for an API call to complete
 * This helper waits for a specific condition that indicates an API call has finished
 * 
 * @param {Function} condition - Function that returns true when API call is complete
 * @param {Object} options - Options for waitFor
 * @returns {Promise<void>}
 */
export const waitForApiCall = async (condition, options = {}) => {
  const { timeout = 10000, interval = 100 } = options;
  return waitFor(condition, { timeout, interval });
};

/**
 * Reset API server state between tests
 * Note: Prism doesn't maintain state, but this can be used for future state management
 * 
 * @returns {Promise<void>}
 */
export const resetApiServer = async () => {
  // Prism doesn't maintain state between requests
  // This is a placeholder for any future state management
  return Promise.resolve();
};

/**
 * Helper to wait for a specific element to appear (indicating API call completed)
 * 
 * @param {Function} queryFn - Query function from render result (getByText, getByTestId, etc.)
 * @param {string|RegExp} text - Text or test ID to wait for
 * @param {Object} options - Options for waitFor
 * @returns {Promise<void>}
 */
export const waitForElement = async (queryFn, text, options = {}) => {
  return waitFor(() => {
    expect(queryFn(text)).toBeTruthy();
  }, { timeout: 10000, ...options });
};

/**
 * Helper to wait for loading state to disappear
 * 
 * @param {Function} queryByFn - Query function that returns null if not found
 * @param {string|RegExp} loadingText - Text or test ID of loading indicator
 * @param {Object} options - Options for waitFor
 * @returns {Promise<void>}
 */
export const waitForLoadingToFinish = async (queryByFn, loadingText = 'Loading', options = {}) => {
  return waitFor(() => {
    expect(queryByFn(loadingText)).toBeNull();
  }, { timeout: 10000, ...options });
};

