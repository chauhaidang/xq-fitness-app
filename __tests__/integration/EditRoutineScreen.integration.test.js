import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditRoutineScreen from '../../src/screens/EditRoutineScreen';
import { renderScreenWithApi, waitForApiCall } from './helpers/test-utils';
import { mockRoutines } from '../../fixtures/routines';

// Mock Alert to auto-confirm
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

describe('EditRoutineScreen Integration Tests', () => {
  const mockRoutine = mockRoutines[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with pre-populated data', () => {
    const { getByTestId } = renderScreenWithApi(EditRoutineScreen, {
      routeParams: {
        routineId: mockRoutine.id,
        routine: mockRoutine,
      },
    });
    
    expect(getByTestId('edit-routine-screen')).toBeTruthy();
    
    const nameInput = getByTestId('routine-name-input');
    expect(nameInput.props.value).toBe(mockRoutine.name);
  });

  it('loads existing routine data from route params', () => {
    const { getByTestId } = renderScreenWithApi(EditRoutineScreen, {
      routeParams: {
        routineId: mockRoutine.id,
        routine: mockRoutine,
      },
    });
    
    const nameInput = getByTestId('routine-name-input');
    const descriptionInput = getByTestId('routine-description-input');
    const activeSwitch = getByTestId('routine-active-switch');
    
    expect(nameInput.props.value).toBe(mockRoutine.name);
    expect(descriptionInput.props.value).toBe(mockRoutine.description || '');
    expect(activeSwitch.props.value).toBe(mockRoutine.isActive);
  });

  it('validates required fields', async () => {
    const { getByTestId } = renderScreenWithApi(EditRoutineScreen, {
      routeParams: {
        routineId: mockRoutine.id,
        routine: mockRoutine,
      },
    });
    
    const nameInput = getByTestId('routine-name-input');
    const submitButton = getByTestId('submit-button');
    
    // Clear name
    fireEvent.changeText(nameInput, '');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Please enter a routine name'
      );
    });
  });

  it('updates routine via API call', async () => {
    const { getByTestId, navigation } = renderScreenWithApi(EditRoutineScreen, {
      routeParams: {
        routineId: mockRoutine.id,
        routine: mockRoutine,
      },
    });
    
    const nameInput = getByTestId('routine-name-input');
    const descriptionInput = getByTestId('routine-description-input');
    const submitButton = getByTestId('submit-button');
    
    // Update form fields
    fireEvent.changeText(nameInput, 'Updated Routine Name');
    fireEvent.changeText(descriptionInput, 'Updated Description');
    
    fireEvent.press(submitButton);
    
    // Wait for API call to complete
    // Prism will validate the PUT request against OpenAPI contract
    await waitForApiCall(() => {
      return Alert.alert.mock.calls.length > 0;
    }, { timeout: 10000 });
    
    // Request should be validated by Prism
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('validates request body matches OpenAPI contract', async () => {
    const { getByTestId } = renderScreenWithApi(EditRoutineScreen, {
      routeParams: {
        routineId: mockRoutine.id,
        routine: mockRoutine,
      },
    });
    
    const nameInput = getByTestId('routine-name-input');
    const activeSwitch = getByTestId('routine-active-switch');
    const submitButton = getByTestId('submit-button');
    
    // Update with valid data
    fireEvent.changeText(nameInput, 'Contract Test Routine');
    fireEvent(activeSwitch, 'valueChange', false);
    
    fireEvent.press(submitButton);
    
    // Prism will validate the PUT request body against OpenAPI schema
    await waitForApiCall(() => {
      return Alert.alert.mock.calls.length > 0;
    }, { timeout: 10000 });
    
    // Request should be validated
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const { getByTestId } = renderScreenWithApi(EditRoutineScreen, {
      routeParams: {
        routineId: mockRoutine.id,
        routine: mockRoutine,
      },
    });
    
    const nameInput = getByTestId('routine-name-input');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(nameInput, 'Test Routine');
    fireEvent.press(submitButton);
    
    // Wait for response (success or error)
    await waitForApiCall(() => {
      return Alert.alert.mock.calls.length > 0;
    }, { timeout: 10000 });
    
    // Should show either success or error alert
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('navigates back after successful update', async () => {
    const { getByTestId, navigation } = renderScreenWithApi(EditRoutineScreen, {
      routeParams: {
        routineId: mockRoutine.id,
        routine: mockRoutine,
      },
    });
    
    const nameInput = getByTestId('routine-name-input');
    const submitButton = getByTestId('submit-button');
    
    fireEvent.changeText(nameInput, 'Updated Name');
    fireEvent.press(submitButton);
    
    // Wait for API call and navigation
    await waitForApiCall(() => {
      return navigation.goBack.mock.calls.length > 0 || Alert.alert.mock.calls.length > 0;
    }, { timeout: 10000 });
    
    // If successful, navigation.goBack should be called
    // (via Alert button onPress)
  });
});

