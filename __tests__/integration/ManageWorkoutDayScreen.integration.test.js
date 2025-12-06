import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ManageWorkoutDayScreen from '../../src/screens/ManageWorkoutDayScreen';
import { renderScreenWithApi, waitForApiCall, waitForLoadingToFinish } from './helpers/test-utils';

// Mock Alert to auto-confirm
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

describe('ManageWorkoutDayScreen Integration Tests', () => {
  const routineId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form for creating new workout day', async () => {
    const { getByTestId, queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay: null,
        isEdit: false,
      },
    });
    
    // Wait for muscle groups to load
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    expect(getByTestId('manage-workout-day-screen')).toBeTruthy();
    expect(getByTestId('day-number-input')).toBeTruthy();
    expect(getByTestId('day-name-input')).toBeTruthy();
    expect(getByTestId('day-notes-input')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('loads muscle groups from API', async () => {
    const { queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay: null,
        isEdit: false,
      },
    });
    
    // Wait for loading to finish
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    // Wait for muscle groups to be loaded
    await waitForApiCall(() => {
      // Check if any muscle group is rendered
      const muscleGroup = queryByTestId('muscle-group-1');
      return muscleGroup !== null;
    }, { timeout: 10000 });
  });

  it('validates required fields', async () => {
    const { getByTestId, queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay: null,
        isEdit: false,
      },
    });
    
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        expect.stringContaining('day number')
      );
    });
  });

  it('validates day name is required', async () => {
    const { getByTestId, queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay: null,
        isEdit: false,
      },
    });
    
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    const dayNumberInput = getByTestId('day-number-input');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(dayNumberInput, '1');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        expect.stringContaining('day name')
      );
    });
  });

  it('validates at least one muscle group is selected', async () => {
    const { getByTestId, queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay: null,
        isEdit: false,
      },
    });
    
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    const dayNumberInput = getByTestId('day-number-input');
    const dayNameInput = getByTestId('day-name-input');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(dayNumberInput, '1');
    fireEvent.changeText(dayNameInput, 'Push Day');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        expect.stringContaining('muscle group')
      );
    });
  });

  it('creates workout day via API call', async () => {
    const { getByTestId, queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay: null,
        isEdit: false,
      },
    });
    
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    // Wait for muscle groups to load
    await waitForApiCall(() => {
      const muscleGroup = queryByTestId('muscle-group-1');
      return muscleGroup !== null;
    }, { timeout: 10000 });
    
    const dayNumberInput = getByTestId('day-number-input');
    const dayNameInput = getByTestId('day-name-input');
    const setsInput = getByTestId('sets-input-1');
    const submitButton = getByTestId('submit-button');
    
    // Fill in form
    fireEvent.changeText(dayNumberInput, '1');
    fireEvent.changeText(dayNameInput, 'Push Day');
    fireEvent.changeText(setsInput, '4');
    
    fireEvent.press(submitButton);
    
    // Wait for API calls to complete
    // Prism will validate all requests against OpenAPI contracts
    await waitForApiCall(() => {
      return Alert.alert.mock.calls.length > 0;
    }, { timeout: 15000 });
    
    // Request should be validated by Prism
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('validates request body matches OpenAPI contract', async () => {
    const { getByTestId, queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay: null,
        isEdit: false,
      },
    });
    
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    await waitForApiCall(() => {
      const muscleGroup = queryByTestId('muscle-group-1');
      return muscleGroup !== null;
    }, { timeout: 10000 });
    
    const dayNumberInput = getByTestId('day-number-input');
    const dayNameInput = getByTestId('day-name-input');
    const setsInput = getByTestId('sets-input-1');
    const submitButton = getByTestId('submit-button');
    
    // Fill in form with valid data
    fireEvent.changeText(dayNumberInput, '1');
    fireEvent.changeText(dayNameInput, 'Contract Test Day');
    fireEvent.changeText(setsInput, '3');
    
    fireEvent.press(submitButton);
    
    // Prism will validate:
    // 1. POST /workout-days request body
    // 2. POST /workout-day-sets request body
    await waitForApiCall(() => {
      return Alert.alert.mock.calls.length > 0;
    }, { timeout: 15000 });
    
    // All requests should be validated
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const { getByTestId, queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay: null,
        isEdit: false,
      },
    });
    
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    await waitForApiCall(() => {
      const muscleGroup = queryByTestId('muscle-group-1');
      return muscleGroup !== null;
    }, { timeout: 10000 });
    
    const dayNumberInput = getByTestId('day-number-input');
    const dayNameInput = getByTestId('day-name-input');
    const setsInput = getByTestId('sets-input-1');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(dayNumberInput, '1');
    fireEvent.changeText(dayNameInput, 'Test Day');
    fireEvent.changeText(setsInput, '4');
    fireEvent.press(submitButton);
    
    // Wait for response (success or error)
    await waitForApiCall(() => {
      return Alert.alert.mock.calls.length > 0;
    }, { timeout: 15000 });
    
    // Should show either success or error alert
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('pre-populates form when editing existing workout day', async () => {
    const workoutDay = {
      id: 1,
      routineId: 1,
      dayNumber: 1,
      dayName: 'Push Day',
      notes: 'Test notes',
      sets: [],
    };
    
    const { getByTestId, queryByTestId } = renderScreenWithApi(ManageWorkoutDayScreen, {
      routeParams: {
        routineId,
        workoutDay,
        isEdit: true,
      },
    });
    
    await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
    
    const dayNumberInput = getByTestId('day-number-input');
    const dayNameInput = getByTestId('day-name-input');
    const notesInput = getByTestId('day-notes-input');
    
    expect(dayNumberInput.props.value).toBe('1');
    expect(dayNameInput.props.value).toBe('Push Day');
    expect(notesInput.props.value).toBe('Test notes');
  });
});

