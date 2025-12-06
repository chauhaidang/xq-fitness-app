/**
 * Example test file demonstrating how to use renderScreen
 * to test screens in isolation without going through the full navigation flow
 */
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreateRoutineScreen from '../../src/screens/CreateRoutineScreen';
import { renderScreen } from '../utils/test-utils';
import * as api from '../../src/services/api';

// Mock the API module
jest.mock('../../src/services/api');

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

describe('CreateRoutineScreen - Isolated Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the screen in isolation', () => {
    // Using renderScreen - no need to manually pass navigation/route props
    const { getByTestId } = renderScreen(CreateRoutineScreen);
    
    expect(getByTestId('create-routine-screen')).toBeTruthy();
    expect(getByTestId('routine-name-input')).toBeTruthy();
    expect(getByTestId('routine-description-input')).toBeTruthy();
  });

  it('allows entering routine name', () => {
    const { getByTestId } = renderScreen(CreateRoutineScreen);
    
    const nameInput = getByTestId('routine-name-input');
    fireEvent.changeText(nameInput, 'My New Routine');
    
    expect(nameInput.props.value).toBe('My New Routine');
  });

  it('creates routine and navigates back on success', async () => {
    api.createRoutine.mockResolvedValue({ id: 1, name: 'Test Routine' });
    
    const { getByTestId, navigation } = renderScreen(CreateRoutineScreen);
    
    // Fill in the form
    fireEvent.changeText(getByTestId('routine-name-input'), 'Test Routine');
    fireEvent.changeText(getByTestId('routine-description-input'), 'Test Description');
    
    // Submit
    fireEvent.press(getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(api.createRoutine).toHaveBeenCalledWith({
        name: 'Test Routine',
        description: 'Test Description',
        isActive: true,
      });
    });
    
    // Navigation should be called (Alert is mocked to auto-confirm, which calls navigation.goBack())
    await waitFor(() => {
      expect(navigation.goBack).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('shows validation error when name is empty', async () => {
    const { getByTestId } = renderScreen(CreateRoutineScreen);
    
    // Try to submit without a name
    fireEvent.press(getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Please enter a routine name'
      );
    });
    
    expect(api.createRoutine).not.toHaveBeenCalled();
  });

  it('toggles active switch', () => {
    const { getByTestId } = renderScreen(CreateRoutineScreen);
    
    const activeSwitch = getByTestId('routine-active-switch');
    expect(activeSwitch.props.value).toBe(true);
    
    fireEvent(activeSwitch, 'valueChange', false);
    expect(activeSwitch.props.value).toBe(false);
  });
});

