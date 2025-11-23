# Maestro App ID Configuration

## App IDs

The app has different IDs depending on how it's built:

### Standalone/Development Build
- **iOS**: `com.xqfitness.app`
- **Android**: `com.xqfitness.app`

### Expo Go (Development)
- **iOS/Android**: `host.exp.Exponent`

## Current Configuration

All test files are currently configured to use: **`com.xqfitness.app`**

This means you need either:
1. A **development build** (built with `expo prebuild` or EAS Build)
2. A **standalone build** (production build)

## Switching to Expo Go

If you want to use **Expo Go** for testing, you need to update the `appId` in:

1. `e2e/maestro.yaml`
2. All files in `e2e/flows/*.yaml`

Change from:
```yaml
appId: com.xqfitness.app
```

To:
```yaml
appId: host.exp.Exponent
```

## Quick Switch Script

You can use this command to switch all test files at once:

### Switch to Expo Go
```bash
find e2e/flows -name "*.yaml" -exec sed -i '' 's/appId: com.xqfitness.app/appId: host.exp.Exponent/g' {} \;
sed -i '' 's/appId: com.xqfitness.app/appId: host.exp.Exponent/g' e2e/maestro.yaml
```

### Switch to Standalone Build
```bash
find e2e/flows -name "*.yaml" -exec sed -i '' 's/appId: host.exp.Exponent/appId: com.xqfitness.app/g' {} \;
sed -i '' 's/appId: host.exp.Exponent/appId: com.xqfitness.app/g' e2e/maestro.yaml
```

## Verifying App ID

### iOS
```bash
# List installed apps and find your app
xcrun simctl listapps booted | grep -i "xq fitness"
```

### Android
```bash
# List installed packages
adb shell pm list packages | grep xqfitness
```

## Building for Testing

### Development Build (Recommended for E2E)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build development version
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

### Local Build
```bash
# Generate native projects
npx expo prebuild

# iOS
cd ios && xcodebuild

# Android
cd android && ./gradlew assembleDebug
```

## Which Should You Use?

- **Expo Go** (`host.exp.Exponent`): 
  - ✅ Fastest to get started
  - ✅ No build required
  - ❌ Limited to Expo SDK features
  - ❌ Can't test custom native code

- **Development Build** (`com.xqfitness.app`):
  - ✅ Full native capabilities
  - ✅ More realistic testing
  - ✅ Can test custom native modules
  - ❌ Requires building the app first

## Current Setup

The tests are configured for **standalone/development builds** (`com.xqfitness.app`).

If you're using Expo Go, update the appId as described above.

