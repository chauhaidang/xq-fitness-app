import axios from 'axios';
import Constants from 'expo-constants';

// Get gateway URL from Expo config or fallback to localhost
const GATEWAY_URL = Constants.expoConfig?.extra?.gatewayUrl || 'http://localhost:8080';

// Change these URLs to match your backend services
// For local development, use your machine's IP address instead of localhost
const READ_SERVICE_URL = `${GATEWAY_URL}/xq-fitness-read-service/api/v1`;
const WRITE_SERVICE_URL = `${GATEWAY_URL}/xq-fitness-write-service/api/v1`;

/**
 * Safe JSON stringify that handles circular references
 * @param {any} obj - Object to stringify
 * @param {number} space - Number of spaces for indentation
 * @returns {string} JSON string or error message if stringification fails
 */
const safeStringify = (obj, space = 2) => {
  const visited = new WeakSet();
  
  const replacer = (key, value) => {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) {
        return '[Circular Reference]';
      }
      visited.add(value);
    }
    return value;
  };

  try {
    return JSON.stringify(obj, replacer, space);
  } catch (error) {
    // Fallback: try to stringify with error message
    try {
      return JSON.stringify({
        error: 'Failed to stringify object',
        message: error.message,
        type: typeof obj,
      }, null, space);
    } catch {
      // Last resort: return a simple error message
      return `[Error: Unable to stringify object - ${error.message}]`;
    }
  }
};

// Check if API logging is enabled via environment variable
const isApiLoggingEnabled = process.env.ENABLE_API_LOGGING === 'true';

// Helper function to log API requests and responses
const setupApiLogging = (apiInstance, serviceName) => {
  // Request interceptor
  apiInstance.interceptors.request.use(
    (config) => {
      if (isApiLoggingEnabled) {
        const logData = {
          service: serviceName,
          method: config.method?.toUpperCase(),
          url: `${config.baseURL}${config.url}`,
          headers: config.headers,
        };

        // Log request body for POST, PUT, PATCH requests
        if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
          logData.requestBody = config.data;
        }

        // Log query parameters for GET requests
        if (config.params) {
          logData.queryParams = config.params;
        }

        console.log(`[API Request - ${serviceName}]`, safeStringify(logData, 2));
      }
      return config;
    },
    (error) => {
      if (isApiLoggingEnabled) {
        console.error(`[API Request Error - ${serviceName}]`, error);
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiInstance.interceptors.response.use(
    (response) => {
      if (isApiLoggingEnabled) {
        const logData = {
          service: serviceName,
          method: response.config.method?.toUpperCase(),
          url: `${response.config.baseURL}${response.config.url}`,
          status: response.status,
          statusText: response.statusText,
          responseBody: response.data,
        };

        console.log(`[API Response - ${serviceName}]`, safeStringify(logData, 2));
      }
      return response;
    },
    (error) => {
      if (isApiLoggingEnabled) {
        const logData = {
          service: serviceName,
          method: error.config?.method?.toUpperCase(),
          url: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown',
          status: error.response?.status,
          statusText: error.response?.statusText,
          errorMessage: error.message,
          responseBody: error.response?.data,
        };

        console.error(`[API Error - ${serviceName}]`, safeStringify(logData, 2));
      }
      return Promise.reject(error);
    }
  );
};

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

// Setup logging for both API instances
setupApiLogging(readApi, 'ReadService');
setupApiLogging(writeApi, 'WriteService');

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

// Snapshot API calls
/**
 * Creates a weekly snapshot for a routine
 * @param {number} routineId - ID of the routine to snapshot
 * @returns {Promise<{id: number, routineId: number, weekStartDate: string, createdAt: string}>} WeeklySnapshotResponse
 * @throws {Error} Throws error if routine not found (404), invalid request (400), or server error (500)
 */
export const createWeeklySnapshot = async (routineId) => {
  const response = await writeApi.post(`/routines/${routineId}/snapshots`);
  return response.data;
};

// Report API calls
/**
 * Gets weekly report for a routine showing total sets per muscle group
 * @param {number} routineId - ID of the routine to get report for
 * @returns {Promise<{routineId: number, weekStartDate: string, hasSnapshot: boolean, snapshotCreatedAt: string|null, muscleGroupTotals: Array<{muscleGroup: object, totalSets: number}>}>} WeeklyReportResponse
 * @throws {Error} Throws error if routine not found (404) or server error (500)
 */
export const getWeeklyReport = async (routineId) => {
  const response = await readApi.get(`/routines/${routineId}/weekly-report`);
  return response.data;
};
