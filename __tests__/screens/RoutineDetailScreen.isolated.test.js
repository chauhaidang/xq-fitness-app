/**
 * Example test file demonstrating how to use renderScreen
 * with route parameters to test screens in isolation
 */
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RoutineDetailScreen from '../../src/screens/RoutineDetailScreen';
import { renderScreen } from '../utils/test-utils';
import { mockRoutines } from '../fixtures/routines';
import * as api from '../../src/services/api';

// Mock the API module
jest.mock('../../src/services/api');

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && buttons.length > 1) {
    // Auto-confirm actions by calling the action button
    const actionButton = buttons.find(btn => 
      btn.text === 'Delete' || 
      btn.style === 'destructive'
    ) || buttons[1];
    if (actionButton && actionButton.onPress) {
      actionButton.onPress();
    }
  } else if (buttons && buttons.length === 1 && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

describe('RoutineDetailScreen - Isolated Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the screen with route params in isolation', async () => {
    const routine = mockRoutines[0];
    api.getRoutineById.mockResolvedValue(routine);
    
    // Using renderScreen with routeParams - no need to navigate to this screen
    const { getByTestId, route } = renderScreen(RoutineDetailScreen, {
      routeParams: { routineId: routine.id }
    });
    
    // Verify route params are passed correctly
    expect(route.params.routineId).toBe(routine.id);
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByTestId('routine-detail-screen')).toBeTruthy();
      expect(getByTestId('routine-name')).toBeTruthy();
    });
  });

  it('displays routine information after loading', async () => {
    const routine = mockRoutines[0];
    api.getRoutineById.mockResolvedValue(routine);
    
    const { getByText, getByTestId } = renderScreen(RoutineDetailScreen, {
      routeParams: { routineId: routine.id }
    });
    
    await waitFor(() => {
      expect(getByText(routine.name)).toBeTruthy();
      expect(getByTestId('routine-info')).toBeTruthy();
    });
  });

  it('navigates to manage workout day screen', async () => {
    const routine = mockRoutines[0];
    api.getRoutineById.mockResolvedValue(routine);
    
    const { getByTestId, navigation } = renderScreen(RoutineDetailScreen, {
      routeParams: { routineId: routine.id }
    });
    
    await waitFor(() => {
      const addButton = getByTestId('add-workout-day-button');
      fireEvent.press(addButton);
      
      expect(navigation.navigate).toHaveBeenCalledWith('ManageWorkoutDay', {
        routineId: routine.id,
        isEdit: false,
      });
    });
  });

  it('navigates to edit workout day', async () => {
    const routine = mockRoutines[0];
    api.getRoutineById.mockResolvedValue(routine);
    
    const { getByTestId, navigation } = renderScreen(RoutineDetailScreen, {
      routeParams: { routineId: routine.id }
    });
    
    await waitFor(() => {
      const editButton = getByTestId(`edit-day-${routine.workoutDays[0].id}`);
      fireEvent.press(editButton);
      
      expect(navigation.navigate).toHaveBeenCalledWith('ManageWorkoutDay', {
        routineId: routine.id,
        workoutDay: routine.workoutDays[0],
        isEdit: true,
      });
    });
  });

  it('deletes workout day', async () => {
    const routine = mockRoutines[0];
    const workoutDay = routine.workoutDays[0];
    api.getRoutineById.mockResolvedValue(routine);
    api.deleteWorkoutDay.mockResolvedValue();
    
    const { getByTestId } = renderScreen(RoutineDetailScreen, {
      routeParams: { routineId: routine.id }
    });
    
    await waitFor(() => {
      const deleteButton = getByTestId(`delete-day-${workoutDay.id}`);
      fireEvent.press(deleteButton);
    });
    
    // Alert is mocked to auto-confirm
    await waitFor(() => {
      expect(api.deleteWorkoutDay).toHaveBeenCalledWith(workoutDay.id);
    });
  });

  it('shows loading state initially', () => {
    // Make API call never resolve immediately
    api.getRoutineById.mockImplementation(() => new Promise(() => {}));
    
    const { getByTestId } = renderScreen(RoutineDetailScreen, {
      routeParams: { routineId: 1 }
    });
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('handles different route params', async () => {
    const routine = mockRoutines[1];
    api.getRoutineById.mockResolvedValue(routine);
    
    const { route } = renderScreen(RoutineDetailScreen, {
      routeParams: { routineId: routine.id }
    });
    
    expect(route.params.routineId).toBe(routine.id);
    
    await waitFor(() => {
      expect(api.getRoutineById).toHaveBeenCalledWith(routine.id);
    });
  });
});

