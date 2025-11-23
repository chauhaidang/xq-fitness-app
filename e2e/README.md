# E2E Tests with Maestro

This directory contains end-to-end tests written in Maestro YAML format.

## Prerequisites

1. Maestro CLI installed (already done)
2. Expo Go app installed on your device/simulator
3. Backend services running (test-env or deployed)

## Running Tests

### Run all tests
```bash
maestro test e2e/flows/
```

### Run specific test
```bash
maestro test e2e/flows/create-routine.yaml
```

### Run on specific device
```bash
# iOS Simulator
maestro test e2e/flows/ --device iPhone_14_Pro

# Android Emulator
maestro test e2e/flows/ --device Pixel_5

# Physical device (connected via USB)
maestro test e2e/flows/ --device <device-id>
```

### List available devices
```bash
maestro devices
```

## Test Flows

1. **create-routine.yaml** - Creates a new workout routine
2. **edit-routine.yaml** - Edits an existing routine
3. **delete-routine.yaml** - Deletes a routine
4. **view-routine-detail.yaml** - Views routine details
5. **add-workout-day.yaml** - Adds a workout day to a routine
6. **edit-workout-day.yaml** - Edits an existing workout day

## Notes

- Tests use testIDs for reliable element selection
- Make sure your app is running in Expo Go before running tests
- Some tests assume existing data (e.g., routine with id 1 exists)
- Alert dialogs are automatically handled by Maestro

## Troubleshooting

**Test fails to find elements:**
- Ensure testIDs are present in your components
- Check that the app is fully loaded before assertions
- Use `maestro studio` to inspect elements

**App not launching:**
- Verify Expo Go is installed
- Check app ID matches: `host.exp.Exponent`
- Ensure device/simulator is running

