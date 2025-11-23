import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../styles/common';

// Import screens
import RoutineListScreen from '../screens/RoutineListScreen';
import RoutineDetailScreen from '../screens/RoutineDetailScreen';
import CreateRoutineScreen from '../screens/CreateRoutineScreen';
import EditRoutineScreen from '../screens/EditRoutineScreen';
import ManageWorkoutDayScreen from '../screens/ManageWorkoutDayScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RoutineList"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="RoutineList"
          component={RoutineListScreen}
          options={{ title: 'My Routines' }}
        />
        <Stack.Screen
          name="RoutineDetail"
          component={RoutineDetailScreen}
          options={{ title: 'Routine Details' }}
        />
        <Stack.Screen
          name="CreateRoutine"
          component={CreateRoutineScreen}
          options={{ title: 'Create Routine' }}
        />
        <Stack.Screen
          name="EditRoutine"
          component={EditRoutineScreen}
          options={{ title: 'Edit Routine' }}
        />
        <Stack.Screen
          name="ManageWorkoutDay"
          component={ManageWorkoutDayScreen}
          options={{ title: 'Manage Workout Day' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
