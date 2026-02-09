#!/usr/bin/env bash
# Strip Push Notifications and Sign in with Apple from iOS entitlements
# so the app can be signed without those capabilities (e.g. with free Apple ID).
# Run after expo prebuild (e.g. as part of npm run bip).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_DIR="${SCRIPT_DIR}/../ios"
PLIST_BUDDY="/usr/libexec/PlistBuddy"

strip_entitlements() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "strip-ios-capabilities: $file not found, skipping"
    return 0
  fi
  for key in "aps-environment" "com.apple.developer.applesignin"; do
    if "$PLIST_BUDDY" -c "Print :$key" "$file" &>/dev/null; then
      "$PLIST_BUDDY" -c "Delete :$key" "$file"
      echo "strip-ios-capabilities: removed $key from $file"
    fi
  done
}

strip_entitlements "${IOS_DIR}/XQFitness/XQFitness.entitlements"
strip_entitlements "${IOS_DIR}/XQFitness/XQFitnessRelease.entitlements"
echo "strip-ios-capabilities: done"
