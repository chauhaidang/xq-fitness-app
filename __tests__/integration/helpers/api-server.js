const { spawn } = require('child_process');

const READ_SERVICE_PORT = 4010;
const WRITE_SERVICE_PORT = 4011;
const READ_SERVICE_URL = `http://localhost:${READ_SERVICE_PORT}`;
const WRITE_SERVICE_URL = `http://localhost:${WRITE_SERVICE_PORT}`;

let readServiceProcess = null;
let writeServiceProcess = null;
let serversStarting = false;
let serversStarted = false;


/**
 * Start Prism mock servers for read and write services
 * Uses singleton pattern to ensure servers only start once
 * @returns {Promise<void>}
 */
const startPrismServers = async () => {
  // Singleton: if servers are already started or starting, wait for them
  if (serversStarted) {
    return Promise.resolve();
  }

  if (serversStarting) {
    // Wait for the ongoing start to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (serversStarted) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 30000);
    });
  }

  serversStarting = true;

  return new Promise((resolve, reject) => {
    // Check if processes are already running
    if (readServiceProcess && writeServiceProcess) {
      serversStarting = false;
      serversStarted = true;
      resolve();
      return;
    }

    // Start read service Prism server
    readServiceProcess = spawn('npx', [
      'prism',
      'mock',
      'api/read-service-api.yaml',
      '--port',
      READ_SERVICE_PORT.toString(),
      '--host',
      '0.0.0.0',
      '--errors', // Enable strict validation - returns errors for invalid requests
    ], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    // Start write service Prism server
    writeServiceProcess = spawn('npx', [
      'prism',
      'mock',
      'api/write-service-api.yaml',
      '--port',
      WRITE_SERVICE_PORT.toString(),
      '--host',
      '0.0.0.0',
      '--errors', // Enable strict validation - returns errors for invalid requests
    ], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    let readServiceReady = false;
    let writeServiceReady = false;

    const checkReady = () => {
      if (readServiceReady && writeServiceReady) {
        serversStarting = false;
        serversStarted = true;
        resolve();
      }
    };

    // Wait for read service to be ready
    readServiceProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('listening') || output.includes('ready')) {
        readServiceReady = true;
        checkReady();
      }
    });

    readServiceProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('listening') || output.includes('ready')) {
        readServiceReady = true;
        checkReady();
      }
    });

    // Wait for write service to be ready
    writeServiceProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('listening') || output.includes('ready')) {
        writeServiceReady = true;
        checkReady();
      }
    });

    writeServiceProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('listening') || output.includes('ready')) {
        writeServiceReady = true;
        checkReady();
      }
    });

    // Fallback: wait a bit and assume ready
    setTimeout(() => {
      readServiceReady = true;
      writeServiceReady = true;
      checkReady();
    }, 3000);

    // Handle errors
    readServiceProcess.on('error', (error) => {
      console.error('Read service error:', error);
      serversStarting = false;
      reject(error);
    });

    writeServiceProcess.on('error', (error) => {
      console.error('Write service error:', error);
      serversStarting = false;
      reject(error);
    });
  });
};

/**
 * Stop Prism mock servers
 * @returns {Promise<void>}
 */
const stopPrismServers = async () => {
  return new Promise((resolve) => {
    serversStarted = false;
    serversStarting = false;

    if (readServiceProcess) {
      readServiceProcess.kill();
      readServiceProcess = null;
    }
    if (writeServiceProcess) {
      writeServiceProcess.kill();
      writeServiceProcess = null;
    }
    // Give processes time to terminate
    setTimeout(resolve, 1000);
  });
};

/**
 * Reset API server state (clear any stored data)
 * Note: Prism doesn't have a built-in reset endpoint, but we can
 * restart the servers or use Prism's dynamic response features
 * @returns {Promise<void>}
 */
const resetApiServer = async () => {
  // Prism doesn't maintain state between requests by default
  // This is a placeholder for any future state management
  return Promise.resolve();
};

/**
 * Configure app to use mock server URLs
 * Returns direct Prism server URLs for integration tests
 * 
 * Integration tests point directly to Prism servers:
 * - Read Service: http://localhost:4010/api/v1
 * - Write Service: http://localhost:4011/api/v1
 */
const configureMockServerUrls = () => {
  return {
    readServiceUrl: `${READ_SERVICE_URL}/api/v1`,
    writeServiceUrl: `${WRITE_SERVICE_URL}/api/v1`,
  };
};

module.exports = {
  startPrismServers,
  stopPrismServers,
  resetApiServer,
  configureMockServerUrls,
  READ_SERVICE_PORT,
  WRITE_SERVICE_PORT,
  READ_SERVICE_URL,
  WRITE_SERVICE_URL,
};

