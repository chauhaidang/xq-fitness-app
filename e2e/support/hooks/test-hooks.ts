import { capturePageSourceAndScreenshot } from '../utils/common.js';

/**
 * Test lifecycle hooks for WebdriverIO
 */
export const testHooks = {
    /**
     * Gets executed after a test (in Mocha/Jasmine only)
     * @param {object}  test             test object
     * @param {object}  context          scope object the test was executed with
     * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
     * @param {*}       result.result    return object of test function
     * @param {number}  result.duration  duration of test
     * @param {boolean} result.passed    true if test has passed, otherwise false
     * @param {object}  result.retries   information about spec related retries, e.g. `{ attempts: 0, limit: 0 }`
     */
    afterTest: async function (test: any, _context: any, { passed, error }: any) {
        if (!passed && error) {
            const sanitized = (test?.title ?? 'failed').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
            const prefix = sanitized || `failed-${Date.now()}`;
            console.log('\n========== HEALING MECHANISM: PAGE SOURCE (DOM TREE) ==========');
            console.log('Test failed. Capturing page source and screenshot to help identify correct locators.');
            await capturePageSourceAndScreenshot({
                pageSourceFileName: `page-source-${prefix}.xml`,
                screenshotFileName: `screenshot-${prefix}.png`,
            });
        }
    },
};
