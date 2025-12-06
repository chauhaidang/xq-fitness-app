#!/bin/bash
# Patch script to fix TARGET_IPHONE_SIMULATOR error in Swift code
# This script should be run after expo prebuild

set -e

IOS_DIR="ios"
XQFITNESS_DIR="${IOS_DIR}/XQFitness"

if [ ! -d "$XQFITNESS_DIR" ]; then
  echo "Error: ${XQFITNESS_DIR} directory not found. Make sure expo prebuild has been run."
  exit 1
fi

echo "Applying iOS simulator fix patch..."

# Create SimulatorCheck.swift file
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

