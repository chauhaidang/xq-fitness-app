# E2E Testing Quick Start

## Prerequisites

1. **Expo Go installed** on your device/simulator
2. **App running** - Start with `npm start` and scan QR code
3. **Backend services running** - Start test environment:
   ```bash
   cd test-env
   xq-infra generate -f test-env
   xq-infra up
   ```

## Running E2E Tests

### Option 1: Run on iOS Simulator (Recommended for first time)

```bash
# Make sure Maestro is in PATH
export PATH="$PATH:$HOME/.maestro/bin"

# Run a single test
maestro test e2e/flows/create-routine.yaml

# Run all tests
maestro test e2e/flows/
```

### Option 2: Run on Android Emulator

```bash
export PATH="$PATH:$HOME/.maestro/bin"
maestro test e2e/flows/create-routine.yaml -p android
```

### Option 3: Run on Physical Device

First, connect your device and ensure Expo Go is running your app, then:

```bash
export PATH="$PATH:$HOME/.maestro/bin"
maestro test e2e/flows/create-routine.yaml --device <device-id>
```

## Test Flow Order

For best results, run tests in this order:

1. `create-routine.yaml` - Creates a test routine
2. `view-routine-detail.yaml` - Views the created routine
3. `edit-routine.yaml` - Edits the routine
4. `add-workout-day.yaml` - Adds a workout day
5. `edit-workout-day.yaml` - Edits the workout day
6. `delete-routine.yaml` - Cleans up (deletes the routine)

## Troubleshooting

**Test fails: "App not found"**
- Make sure Expo Go is installed
- Ensure app is running and loaded
- Check app ID matches: `host.exp.Exponent`

**Test fails: "Element not found"**
- Use `maestro studio` to inspect elements
- Verify testIDs are present in components
- Check that the app screen has loaded

**Test fails: API errors**
- Verify backend services are running
- Check API URLs in `.env` file
- Ensure network connectivity

## Using Maestro Studio

To inspect elements and debug:

```bash
maestro studio
```

This opens an interactive tool to explore your app's UI elements.

