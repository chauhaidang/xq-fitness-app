#!/bin/bash
# Deploy script for XQ Fitness iOS Simulator
# This script installs and launches the built app on a running iOS simulator
# Usage: ./deploy-sim.sh [simulator-name-or-udid]

set -e

# Configuration
BUNDLE_ID="com.xqfitness.app"
APP_NAME="XQ Fitness"
BUILD_DIR="./ios/build"
SCHEME="XQFitness"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "ios" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Find the built .app bundle
print_info "Looking for built app bundle..."
APP_BUNDLE=$(find "${BUILD_DIR}" -name "${SCHEME}.app" -type d 2>/dev/null | head -1)

if [ -z "$APP_BUNDLE" ]; then
    print_error "App bundle not found in ${BUILD_DIR}"
    print_info "Please build the app first using: npm run bi"
    exit 1
fi

print_info "Found app bundle: ${APP_BUNDLE}"

# Function to get available simulators
get_simulators() {
    xcrun simctl list devices available --json | \
    jq -r '.devices | to_entries[] | .value[] | select(.isAvailable == true) | "\(.udid)|\(.name)|\(.runtime)"' | \
    sort -t'|' -k2
}

# Function to find a booted simulator
find_booted_simulator() {
    xcrun simctl list devices booted --json | \
    jq -r '.devices | to_entries[] | .value[] | select(.state == "Booted") | .udid' | head -1
}

# Function to boot a simulator
boot_simulator() {
    local udid=$1
    print_info "Booting simulator ${udid}..."
    xcrun simctl boot "$udid" 2>/dev/null || true
    sleep 2
}

# Function to open Simulator app
open_simulator_app() {
    print_info "Opening Simulator app..."
    open -a Simulator
    sleep 3
}

# Determine which simulator to use
SIMULATOR_UDID=""
SIMULATOR_NAME=""

if [ -n "$1" ]; then
    # User provided simulator name or UDID
    SIMULATOR_UDID=$(xcrun simctl list devices --json | \
        jq -r --arg search "$1" '.devices | to_entries[] | .value[] | 
        select((.name | ascii_downcase | contains($search | ascii_downcase)) or .udid == $search) | 
        select(.isAvailable == true) | .udid' | head -1)
    
    if [ -z "$SIMULATOR_UDID" ]; then
        print_error "Simulator '$1' not found"
        print_info "Available simulators:"
        get_simulators | while IFS='|' read -r udid name runtime; do
            echo "  - $name ($runtime)"
        done
        exit 1
    fi
    SIMULATOR_NAME=$(xcrun simctl list devices --json | \
        jq -r --arg udid "$SIMULATOR_UDID" '.devices | to_entries[] | .value[] | 
        select(.udid == $udid) | .name')
else
    # Try to find a booted simulator first
    SIMULATOR_UDID=$(find_booted_simulator)
    
    if [ -z "$SIMULATOR_UDID" ]; then
        # No booted simulator, find the first available iPhone
        print_info "No booted simulator found. Looking for available iPhone simulators..."
        SIMULATOR_UDID=$(xcrun simctl list devices available --json | \
            jq -r '.devices | to_entries[] | .value[] | 
            select(.name | contains("iPhone")) | 
            select(.isAvailable == true) | .udid' | head -1)
        
        if [ -z "$SIMULATOR_UDID" ]; then
            print_error "No available iPhone simulators found"
            exit 1
        fi
        
        SIMULATOR_NAME=$(xcrun simctl list devices --json | \
            jq -r --arg udid "$SIMULATOR_UDID" '.devices | to_entries[] | .value[] | 
            select(.udid == $udid) | .name')
        
        boot_simulator "$SIMULATOR_UDID"
        open_simulator_app
    else
        SIMULATOR_NAME=$(xcrun simctl list devices --json | \
            jq -r --arg udid "$SIMULATOR_UDID" '.devices | to_entries[] | .value[] | 
            select(.udid == $udid) | .name')
        print_info "Using already booted simulator: ${SIMULATOR_NAME}"
    fi
fi

print_info "Target simulator: ${SIMULATOR_NAME} (${SIMULATOR_UDID})"

# Uninstall existing app if present
print_info "Checking for existing installation..."
if xcrun simctl listapps "$SIMULATOR_UDID" | grep -q "$BUNDLE_ID"; then
    print_warn "App already installed. Uninstalling..."
    xcrun simctl uninstall "$SIMULATOR_UDID" "$BUNDLE_ID" 2>/dev/null || true
    sleep 1
fi

# Install the app
print_info "Installing app to simulator..."
if xcrun simctl install "$SIMULATOR_UDID" "$APP_BUNDLE"; then
    print_info "App installed successfully"
else
    print_error "Failed to install app"
    exit 1
fi

# Launch the app
print_info "Launching ${APP_NAME}..."
xcrun simctl launch "$SIMULATOR_UDID" "$BUNDLE_ID"

# Wait a moment for the app to start
sleep 2

print_info "App launched successfully!"
print_info "Simulator: ${SIMULATOR_NAME}"
print_info "Bundle ID: ${BUNDLE_ID}"

