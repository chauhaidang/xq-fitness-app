#!/bin/bash
# Patch script to fix TARGET_IPHONE_SIMULATOR error in Swift code
# This script can be run after npm install (to patch node_modules) 
# and after expo prebuild (to patch ios directory)

set -e

echo "Applying iOS simulator fix patch..."

# Fix expo-dev-menu DevMenuViewController.swift
# This file uses TARGET_IPHONE_SIMULATOR which is not available in Swift
DEV_MENU_FILE="node_modules/expo-dev-launcher/node_modules/expo-dev-menu/ios/DevMenuViewController.swift"
if [ ! -f "$DEV_MENU_FILE" ]; then
  # Try alternative locations
  DEV_MENU_FILE=$(find node_modules -name "DevMenuViewController.swift" -path "*/expo-dev-menu/ios/*" 2>/dev/null | head -1)
fi

if [ -f "$DEV_MENU_FILE" ]; then
  echo "Patching expo-dev-menu DevMenuViewController.swift at: $DEV_MENU_FILE"
  # Use perl for reliable multiline replacement
  perl -i -pe 's/let isSimulator = TARGET_IPHONE_SIMULATOR > 0/#if targetEnvironment(simulator)\n    let isSimulator = true\n#else\n    let isSimulator = false\n#endif/' "$DEV_MENU_FILE"
  echo "Fixed expo-dev-menu DevMenuViewController.swift"
else
  echo "Warning: expo-dev-menu DevMenuViewController.swift not found"
  echo "Searched in node_modules/expo-dev-launcher/node_modules/expo-dev-menu/ios/"
fi

# Create SimulatorCheck.swift file (in case other code needs it)
# Only create if ios directory exists (after prebuild)
IOS_DIR="ios"
XQFITNESS_DIR="${IOS_DIR}/XQFitness"
if [ -d "$XQFITNESS_DIR" ]; then
  echo "Creating SimulatorCheck.swift in ios directory..."
  cat > "${XQFITNESS_DIR}/SimulatorCheck.swift" << 'EOF'
//
// SimulatorCheck.swift
// Provides TARGET_IPHONE_SIMULATOR constant for Swift code compatibility
//

import Foundation

// Provide TARGET_IPHONE_SIMULATOR constant for Swift code
// This is a workaround for Swift code that tries to use the C preprocessor macro TARGET_IPHONE_SIMULATOR
// In Swift, use #if targetEnvironment(simulator) for conditional compilation,
// but this constant provides compatibility for code that expects TARGET_IPHONE_SIMULATOR as a variable
#if targetEnvironment(simulator)
public let TARGET_IPHONE_SIMULATOR: Int = 1
#else
public let TARGET_IPHONE_SIMULATOR: Int = 0
#endif
EOF
  echo "Created SimulatorCheck.swift"
else
  echo "ios directory not found, skipping SimulatorCheck.swift creation (will be created after prebuild)"
fi

# Update bridging header to include TargetConditionals.h
BRIDGING_HEADER="${XQFITNESS_DIR}/XQFitness-Bridging-Header.h"
if [ -f "$BRIDGING_HEADER" ]; then
  # Check if TargetConditionals.h is already imported
  if ! grep -q "#import <TargetConditionals.h>" "$BRIDGING_HEADER"; then
    # Add the import if it's not already there
    cat >> "$BRIDGING_HEADER" << 'EOF'

#import <TargetConditionals.h>
EOF
    echo "Updated bridging header"
  else
    echo "Bridging header already has TargetConditionals.h import"
  fi
else
  echo "Warning: Bridging header not found at ${BRIDGING_HEADER}"
fi

echo "iOS simulator fix patch applied successfully!"

