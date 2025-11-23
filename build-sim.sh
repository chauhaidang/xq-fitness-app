#!/bin/bash
# Build script for XQ Fitness iOS Simulator
# This script should be run from the ios/ directory after pod install

WORKSPACE="XQFitness.xcworkspace"
SCHEME="XQFitness"
CONFIGURATION="Release"
DERIVED_DATA_PATH="./build"
DESTINATION="generic/platform=iOS Simulator"

# Resolve package dependencies
xcodebuild -resolvePackageDependencies \
  -workspace "${WORKSPACE}" \
  -scheme "${SCHEME}" \
  -configuration "${CONFIGURATION}" \
  -derivedDataPath "${DERIVED_DATA_PATH}" \
  -destination "${DESTINATION}"

# Show build settings
xcodebuild -showBuildSettings \
  -workspace "${WORKSPACE}" \
  -scheme "${SCHEME}" \
  -configuration "${CONFIGURATION}" \
  -derivedDataPath "${DERIVED_DATA_PATH}" \
  -destination "${DESTINATION}" 2>&1

# Build the project
set -o pipefail && xcodebuild \
  -workspace "${WORKSPACE}" \
  -scheme "${SCHEME}" \
  -configuration "${CONFIGURATION}" \
  -derivedDataPath "${DERIVED_DATA_PATH}" \
  -destination "${DESTINATION}" \
  build