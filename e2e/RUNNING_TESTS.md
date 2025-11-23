# Running E2E Tests - Step by Step Guide

## App ID Configuration

**Important**: The tests are configured to use `com.xqfitness.app` (standalone/development build).

If you're using **Expo Go**, you need to change the `appId` in all test files to `host.exp.Exponent`.

See [APP_ID_CONFIG.md](./APP_ID_CONFIG.md) for details on switching between Expo Go and standalone builds.

## Before Running Tests

### 1. Start Backend Services
```bash
cd test-env
xq-infra generate -f test-env
xq-infra up
```

Verify services are running:
- Read service: http://localhost:8080
- Write service: http://localhost:3000

### 2. Start Your App

**For Standalone/Development Build:**
- Install the built app on your device/simulator
- Launch the app manually
- Wait for it to fully load

**For Expo Go:**
In a separate terminal:
```bash
npm start
```

Then:
- **iOS Simulator**: Press `i` or scan QR code
- **Android Emulator**: Press `a` or scan QR code  
- **Physical Device**: Scan QR code with Expo Go app

**Important**: Make sure the app ID in test files matches your setup:
- Expo Go: `host.exp.Exponent`
- Standalone: `com.xqfitness.app`

Wait for the app to fully load before running tests.

### 3. Verify App is Running

You should see:
- "My Routines" screen title
- Either a list of routines or "No routines found" message
- The "+" button in the bottom right

## Running Tests

### Setup Maestro Path
```bash
export PATH="$PATH:$HOME/.maestro/bin"
```

### Run a Single Test
```bash
# Create routine test
maestro test e2e/flows/create-routine.yaml

# View routine detail
maestro test e2e/flows/view-routine-detail.yaml

# Edit routine
maestro test e2e/flows/edit-routine.yaml

# Add workout day
maestro test e2e/flows/add-workout-day.yaml

# Edit workout day
maestro test e2e/flows/edit-workout-day.yaml

# Delete routine (cleanup)
maestro test e2e/flows/delete-routine.yaml
```

### Run All Tests in Sequence
```bash
# Run all tests
maestro test e2e/flows/
```

### Run on Specific Platform
```bash
# iOS
maestro test e2e/flows/create-routine.yaml -p ios

# Android
maestro test e2e/flows/create-routine.yaml -p android
```

## Test Flow Recommendations

For best results, run tests in this order:

1. **create-routine.yaml** - Creates a test routine
2. **view-routine-detail.yaml** - Views the routine
3. **edit-routine.yaml** - Edits the routine name
4. **add-workout-day.yaml** - Adds a workout day
5. **edit-workout-day.yaml** - Edits the workout day
6. **delete-routine.yaml** - Cleans up (optional)

## Troubleshooting

### "App not found" or "Cannot launch app"
- ✅ Check app ID in test files matches your setup:
  - Expo Go: `host.exp.Exponent`
  - Standalone: `com.xqfitness.app`
- ✅ For Expo Go: Make sure Expo Go is installed and app is running
- ✅ For Standalone: Make sure the app is installed on device/simulator
- ✅ Verify app is actually installed: 
  - iOS: `xcrun simctl listapps booted | grep xqfitness`
  - Android: `adb shell pm list packages | grep xqfitness`
- ✅ Try launching the app manually first

### "Element not visible" errors
- ✅ Wait for app to fully load before running tests
- ✅ Check that backend services are running
- ✅ Verify testIDs are present in components
- ✅ Use `maestro studio` to inspect elements

### "API Error" or network issues
- ✅ Verify backend services are running (`xq-infra status`)
- ✅ Check API URLs in `.env` file
- ✅ Ensure device/simulator can reach localhost

### Tests run but fail assertions
- ✅ Check that test data exists (for edit/delete tests)
- ✅ Verify backend has data seeded
- ✅ Run create-routine test first to create test data

## Using Maestro Studio

To debug and inspect elements:

```bash
maestro studio
```

This opens an interactive tool where you can:
- See all UI elements
- Get element selectors
- Test interactions
- Debug test failures

## Continuous Testing

For continuous testing during development:

```bash
# Watch mode (runs tests when files change)
maestro test e2e/flows/ --continuous
```

## Test Output

Maestro provides:
- ✅ Pass/fail status for each test
- 📸 Screenshots on failure
- 📝 Detailed logs
- 🎥 Video recordings (with `--record` flag)

## Next Steps

Once tests are passing:
1. Integrate into CI/CD pipeline
2. Add more edge case tests
3. Test on multiple devices
4. Add performance tests

