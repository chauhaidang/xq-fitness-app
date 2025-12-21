/**
 * Global teardown for Component tests
 * Runs after all tests complete
 */

import { logger, generateMarkdownFromJunit } from '@chauhaidang/xq-js-common-kit';
import fs from 'fs';
import { writeFileSync } from 'node:fs';

export default async () => {
  logger.info('🧹 Integration Test-Teardown: Running global teardown');
  
  // Generate test report
  try {
    const xmlContent = fs.readFileSync('./__tests__/integration/tsr/junit.xml', 'utf8');
    const markdown = await generateMarkdownFromJunit(xmlContent);
    writeFileSync('./__tests__/integration/tsr/report.md', markdown);
  } catch (error) {
    logger.warn('⚠️ Could not generate test report:', error);
  }
  
  logger.info('✅ Integration Test-Teardown: Global teardown complete');
};
