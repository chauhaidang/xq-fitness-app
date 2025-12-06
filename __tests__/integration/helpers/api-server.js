const { spawn } = require('child_process');
const axios = require('axios');

const READ_SERVICE_PORT = 4010;
const WRITE_SERVICE_PORT = 4011;
const READ_SERVICE_URL = `http://localhost:${READ_SERVICE_PORT}`;
const WRITE_SERVICE_URL = `http://localhost:${WRITE_SERVICE_PORT}`;

let readServiceProcess = null;
let writeServiceProcess = null;

/**
 * Start Prism mock servers for read and write services
 * @returns {Promise<void>}
 */
const startPrismServers = async () => {
  return new Promise((resolve, reject) => {
    // Start read service
    readServiceProcess = spawn('npx', [
      'prism',
      'mock',
      'api/read-service-api.yaml',
      '--port',
      READ_SERVICE_PORT.toString(),
      '--host',
      '0.0.0.0',
    ], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    // Start write service
    writeServiceProcess = spawn('npx', [
      'prism',
      'mock',
      'api/write-service-api.yaml',
      '--port',
      WRITE_SERVICE_PORT.toString(),
      '--host',
      '0.0.0.0',
    ], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    let readServiceReady = false;
    let writeServiceReady = false;

    const checkReady = () => {
      if (readServiceReady && writeServiceReady) {
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
      reject(error);
    });

    writeServiceProcess.on('error', (error) => {
      console.error('Write service error:', error);
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
 * This overrides the Expo config gateway URL
 * 
 * Note: The API service constructs URLs as:
 * - READ_SERVICE_URL = `${GATEWAY_URL}/xq-fitness-read-service/api/v1`
 * - WRITE_SERVICE_URL = `${GATEWAY_URL}/xq-fitness-write-service/api/v1`
 * 
 * Prism serves OpenAPI specs directly, so we need to configure the gateway URL
 * to point to Prism, and Prism will handle the path routing based on the OpenAPI spec.
 */
const configureMockServerUrls = () => {
  // Set gateway URL to point to read service port
  // The API service will construct full paths
  // Prism will handle routing based on OpenAPI spec paths
  process.env.GATEWAY_URL = `http://localhost:${READ_SERVICE_PORT}`;
  
  return {
    readServiceUrl: READ_SERVICE_URL,
    writeServiceUrl: WRITE_SERVICE_URL,
    gatewayUrl: `http://localhost:${READ_SERVICE_PORT}`,
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

