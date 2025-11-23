#!/bin/bash

# Script to switch Maestro test files between Expo Go and Standalone app IDs
# Run from project root: ./e2e/switch-app-id.sh [expo-go|standalone]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

EXPO_GO_ID="host.exp.Exponent"
STANDALONE_ID="com.xqfitness.app"

if [ "$1" == "expo-go" ] || [ "$1" == "expo" ]; then
    echo "Switching to Expo Go (host.exp.Exponent)..."
    find e2e/flows -name "*.yaml" -exec sed -i '' "s/appId: ${STANDALONE_ID}/appId: ${EXPO_GO_ID}/g" {} \;
    sed -i '' "s/appId: ${STANDALONE_ID}/appId: ${EXPO_GO_ID}/g" e2e/maestro.yaml 2>/dev/null || true
    echo "✅ All test files now use: ${EXPO_GO_ID}"
elif [ "$1" == "standalone" ] || [ "$1" == "build" ]; then
    echo "Switching to Standalone Build (com.xqfitness.app)..."
    find e2e/flows -name "*.yaml" -exec sed -i '' "s/appId: ${EXPO_GO_ID}/appId: ${STANDALONE_ID}/g" {} \;
    sed -i '' "s/appId: ${EXPO_GO_ID}/appId: ${STANDALONE_ID}/g" e2e/maestro.yaml 2>/dev/null || true
    echo "✅ All test files now use: ${STANDALONE_ID}"
else
    echo "Usage: $0 [expo-go|standalone]"
    echo ""
    echo "  expo-go     - Switch to Expo Go (host.exp.Exponent)"
    echo "  standalone  - Switch to Standalone Build (com.xqfitness.app)"
    echo ""
    echo "Current appId in test files:"
    grep -h "appId:" e2e/flows/*.yaml 2>/dev/null | head -1 || echo "  (no test files found)"
    exit 1
fi

