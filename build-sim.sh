xcodebuild -resolvePackageDependencies -workspace ./XQFitness.xcworkspace -scheme XQFitness -configuration Release -derivedDataPath ./build -destination 'generic/platform=iOS Simulator'

xcodebuild -showBuildSettings -workspace ./XQFitness.xcworkspace -scheme XQFitness -configuration Release -derivedDataPath ./build -destination 'generic/platform=iOS Simulator' 2>&1

set -o pipefail && xcodebuild -workspace ./XQFitness.xcworkspace -scheme XQFitness -configuration Release -derivedDataPath ./build -destination 'generic/platform=iOS Simulator' build
