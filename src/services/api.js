import axios from 'axios';
import Constants from 'expo-constants';

// Get gateway URL from Expo config or fallback to localhost
const GATEWAY_URL = Constants.expoConfig?.extra?.gatewayUrl || 'http://localhost:8080';

// Change these URLs to match your backend services
// For local development, use your machine's IP address instead of localhost
const READ_SERVICE_URL = `${GATEWAY_URL}/xq-fitness-read-service/api/v1`;
const WRITE_SERVICE_URL = `${GATEWAY_URL}/xq-fitness-write-service/api/v1`;

// Create axios instances for each service
const readApi = axios.create({
  baseURL: READ_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const writeApi = axios.create({
  baseURL: WRITE_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Read Service API calls
export const getMuscleGroups = async () => {
  const response = await readApi.get('/muscle-groups');
  return response.data;
};

export const getRoutines = async (isActive = null) => {
  const params = isActive !== null ? { isActive } : {};
  const response = await readApi.get('/routines', { params });
  console.log('response', response.data);
  return response.data;
};

export const getRoutineById = async (routineId) => {
  const response = await readApi.get(`/routines/${routineId}`);
  return response.data;
};

export const getWorkoutDays = async (routineId) => {
  const response = await readApi.get(`/routines/${routineId}/days`);
  return response.data;
};

// Write Service API calls
export const createRoutine = async (data) => {
  const response = await writeApi.post('/routines', data);
  return response.data;
};

export const updateRoutine = async (routineId, data) => {
  const response = await writeApi.put(`/routines/${routineId}`, data);
  return response.data;
};

export const deleteRoutine = async (routineId) => {
  await writeApi.delete(`/routines/${routineId}`);
};

export const createWorkoutDay = async (data) => {
  const response = await writeApi.post('/workout-days', data);
  return response.data;
};

export const updateWorkoutDay = async (dayId, data) => {
  const response = await writeApi.put(`/workout-days/${dayId}`, data);
  return response.data;
};

export const deleteWorkoutDay = async (dayId) => {
  await writeApi.delete(`/workout-days/${dayId}`);
};

export const createWorkoutDaySet = async (data) => {
  const response = await writeApi.post('/workout-day-sets', data);
  return response.data;
};

export const updateWorkoutDaySet = async (setId, data, workoutDayId = null, muscleGroupId = null) => {
  let url = `/workout-day-sets/${setId}`;
  
  // If workoutDayId and muscleGroupId are provided, use query parameters
  // The setId in the path will be ignored by the API when query params are present
  if (workoutDayId !== null && muscleGroupId !== null) {
    url = `/workout-day-sets/0?workoutDayId=${workoutDayId}&muscleGroupId=${muscleGroupId}`;
  }
  
  const response = await writeApi.put(url, data);
  return response.data;
};

export const deleteWorkoutDaySet = async (setId) => {
  await writeApi.delete(`/workout-day-sets/${setId}`);
};
