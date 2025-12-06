#!/bin/bash
# Build script for XQ Fitness iOS Device (IPA)
# This script can be run from either the mobile/ or ios/ directory
# Usage: GATEWAY_URL=https://your-url.com sh ./ios/build-device.sh
#        OR: cd ios && GATEWAY_URL=https://your-url.com sh ./build-device.sh
# 
# This builds a PRODUCTION standalone IPA that does NOT connect to Metro.
# The bundle is embedded in the app, not loaded from a development server.

set -e

# Determine script location and change to ios directory if needed
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# If script is in ios/ directory, use it; otherwise assume we're in parent and need to cd
if [[ "$SCRIPT_DIR" == *"/ios" ]]; then
  IOS_DIR="$SCRIPT_DIR"
  cd "$IOS_DIR"
else
  # Script is being run from parent directory, find ios directory
  IOS_DIR="$(cd "$SCRIPT_DIR/ios" 2>/dev/null || cd "$(dirname "$SCRIPT_DIR")/ios" 2>/dev/null || echo "./ios")"
  if [ ! -d "$IOS_DIR" ]; then
    echo "❌ Error: Cannot find ios directory"
    echo "   Please run this script from the mobile/ directory or ios/ directory"
    exit 1
  fi
  cd "$IOS_DIR"
fi

WORKSPACE="XQFitness.xcworkspace"
SCHEME="XQFitness"
CONFIGURATION="Release"
DERIVED_DATA_PATH="./build"
DESTINATION="generic/platform=iOS"
ARCHIVE_PATH="${DERIVED_DATA_PATH}/XQFitness.xcarchive"
EXPORT_PATH="${DERIVED_DATA_PATH}/Export"
IPA_PATH="${EXPORT_PATH}/XQFitness.ipa"

# Verify workspace exists (xcworkspace is a directory, not a file)
if [ ! -d "$WORKSPACE" ]; then
  echo "❌ Error: $WORKSPACE not found in $(pwd)"
  echo "   Make sure you've run 'expo prebuild' and 'pod install' first"
  exit 1
fi

echo "Building XQ Fitness for iOS Device (PRODUCTION STANDALONE)..."
echo "Working directory: $(pwd)"
echo "Configuration: ${CONFIGURATION}"
echo "Archive Path: ${ARCHIVE_PATH}"
echo "⚠️  This build will NOT connect to Metro - it's a standalone production build"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf "${DERIVED_DATA_PATH}"

# Resolve package dependencies
echo "Resolving package dependencies..."
xcodebuild -resolvePackageDependencies \
  -workspace "${WORKSPACE}" \
  -scheme "${SCHEME}" \
  -configuration "${CONFIGURATION}" \
  -derivedDataPath "${DERIVED_DATA_PATH}" \
  -destination "${DESTINATION}"

# Check if device is connected (for free provisioning)
echo "Checking for connected devices..."
DEVICES=$(xcrun xctrace list devices 2>&1 | grep -i "iphone" | grep -v "Simulator" || echo "")
if [ -z "$DEVICES" ]; then
  echo "⚠️  Warning: No physical iPhone detected."
  echo "For free provisioning, you need to:"
  echo "  1. Connect your iPhone via USB"
  echo "  2. Trust the computer on your iPhone"
  echo "  3. Run this script again"
  echo ""
  echo "Alternatively, you can register your device UDID manually at:"
  echo "https://developer.apple.com/account/resources/devices/list"
  echo ""
fi

# Build archive with production settings
# Release configuration ensures the bundle is embedded and Metro is NOT used
# In Release builds, Expo automatically embeds the JavaScript bundle
echo "Building archive (Production/Standalone mode)..."
echo "   - Configuration: ${CONFIGURATION} (ensures embedded bundle, no Metro)"
echo "   - This build will be standalone and NOT connect to development server"

set -o pipefail && xcodebuild \
  -workspace "${WORKSPACE}" \
  -scheme "${SCHEME}" \
  -configuration "${CONFIGURATION}" \
  -destination "${DESTINATION}" \
  -archivePath "${ARCHIVE_PATH}" \
  -derivedDataPath "${DERIVED_DATA_PATH}" \
  -allowProvisioningUpdates \
  archive || {
    echo ""
    echo "❌ Archive failed. Common issues:"
    echo "  1. No device connected - Connect your iPhone via USB"
    echo "  2. Device not trusted - Trust this computer on your iPhone"
    echo "  3. Device not registered - Xcode will register it automatically when connected"
    echo ""
    exit 1
  }

# Export IPA
echo "Exporting IPA..."
if [ ! -f "./ExportOptions.plist" ]; then
  echo "⚠️  Warning: ExportOptions.plist not found. Creating a basic one..."
  echo "   You may need to update it with your Team ID and provisioning profile."
  cat > "./ExportOptions.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>method</key>
	<string>development</string>
	<key>signingStyle</key>
	<string>automatic</string>
	<key>compileBitcode</key>
	<false/>
	<key>stripSwiftSymbols</key>
	<true/>
</dict>
</plist>
EOF
fi

xcodebuild -exportArchive \
  -archivePath "${ARCHIVE_PATH}" \
  -exportPath "${EXPORT_PATH}" \
  -exportOptionsPlist "./ExportOptions.plist" \
  -allowProvisioningUpdates

if [ -f "${IPA_PATH}" ]; then
  echo ""
  echo "✅ IPA created successfully at: ${IPA_PATH}"
  echo ""
  echo "📦 This is a PRODUCTION STANDALONE build:"
  echo "   ✓ JavaScript bundle is embedded in the app"
  echo "   ✓ Will NOT connect to Metro/development server"
  echo "   ✓ Can run offline without Expo CLI"
  echo ""
  echo "You can now install this IPA on your iPhone using:"
  echo "   - Xcode Devices window (Window → Devices and Simulators)"
  echo "   - Or drag and drop the IPA to your device in Finder"
else
  echo "❌ Failed to create IPA file"
  exit 1
fi

