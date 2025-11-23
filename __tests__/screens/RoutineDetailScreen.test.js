import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RoutineDetailScreen from '../../src/screens/RoutineDetailScreen';
import { mockNavigation, mockRoute } from '../utils/test-utils';
import { mockRoutineDetail } from '../fixtures/routines';
import * as api from '../../src/services/api';

jest.mock('../../src/services/api');

jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && buttons.length > 1) {
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

describe('RoutineDetailScreen', () => {
  const route = mockRoute({ routineId: 1 });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    api.getRoutineById.mockImplementation(() => new Promise(() => {}));
    
    const { getByTestId } = render(
      <RoutineDetailScreen navigation={mockNavigation} route={route} />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays routine details after loading', async () => {
    api.getRoutineById.mockResolvedValue(mockRoutineDetail);
    
    const { getByTestId, getByText } = render(
      <RoutineDetailScreen navigation={mockNavigation} route={route} />
    );
    
    await waitFor(() => {
      expect(getByTestId('routine-info')).toBeTruthy();
      expect(getByText(mockRoutineDetail.name)).toBeTruthy();
      expect(getByText(mockRoutineDetail.description)).toBeTruthy();
    });
  });

  it('displays workout days', async () => {
    api.getRoutineById.mockResolvedValue(mockRoutineDetail);
    
    const { getByTestId, getByText } = render(
      <RoutineDetailScreen navigation={mockNavigation} route={route} />
    );
    
    await waitFor(() => {
      expect(getByTestId(`workout-day-${mockRoutineDetail.workoutDays[0].id}`)).toBeTruthy();
      expect(getByText('Day 1: Push Day')).toBeTruthy();
    });
  });

  it('navigates to add workout day screen', async () => {
    api.getRoutineById.mockResolvedValue(mockRoutineDetail);
    
    const { getByTestId } = render(
      <RoutineDetailScreen navigation={mockNavigation} route={route} />
    );
    
    await waitFor(() => {
      const addButton = getByTestId('add-workout-day-button');
      fireEvent.press(addButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ManageWorkoutDay', {
        routineId: 1,
        isEdit: false,
      });
    });
  });

  it('navigates to edit workout day screen', async () => {
    api.getRoutineById.mockResolvedValue(mockRoutineDetail);
    
    const { getByTestId } = render(
      <RoutineDetailScreen navigation={mockNavigation} route={route} />
    );
    
    await waitFor(() => {
      const editButton = getByTestId(`edit-day-${mockRoutineDetail.workoutDays[0].id}`);
      fireEvent.press(editButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ManageWorkoutDay', {
        routineId: 1,
        workoutDay: mockRoutineDetail.workoutDays[0],
        isEdit: true,
      });
    });
  });

  it('deletes workout day', async () => {
    api.getRoutineById.mockResolvedValue(mockRoutineDetail);
    api.deleteWorkoutDay.mockResolvedValue();
    
    const { getByTestId } = render(
      <RoutineDetailScreen navigation={mockNavigation} route={route} />
    );
    
    await waitFor(() => {
      const deleteButton = getByTestId(`delete-day-${mockRoutineDetail.workoutDays[0].id}`);
      fireEvent.press(deleteButton);
    });
    
    await waitFor(() => {
      expect(api.deleteWorkoutDay).toHaveBeenCalledWith(mockRoutineDetail.workoutDays[0].id);
    });
  });

  it('displays empty state when no workout days', async () => {
    const routineWithoutDays = { ...mockRoutineDetail, workoutDays: [] };
    api.getRoutineById.mockResolvedValue(routineWithoutDays);
    
    const { getByTestId } = render(
      <RoutineDetailScreen navigation={mockNavigation} route={route} />
    );
    
    await waitFor(() => {
      expect(getByTestId('no-workout-days')).toBeTruthy();
      expect(getByTestId('add-first-day-button')).toBeTruthy();
    });
  });
});

