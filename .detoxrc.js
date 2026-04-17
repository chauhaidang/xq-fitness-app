// Detox configuration — uses xq-test-utils wrapper (e2e-config skill)
// All internal Detox settings (apps, devices, configurations, timeouts)
// are handled by createDetoxConfig. Only the binary path is needed.
const { createDetoxConfig } = require('@chauhaidang/xq-test-utils');

const config = createDetoxConfig(
    'ios/build/Products/Release-iphonesimulator/XQFitness.app',
    {simulator: 'iPhone 16 Pro'}
);

module.exports = config;
