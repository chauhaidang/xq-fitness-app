module.exports = {
  expo: {
    name: "XQ Fitness",
    slug: "xq-fitness",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.xqfitness.app",
      // teamId is only needed for device builds, not simulator builds
      // For simulator builds with free Apple ID, leave this commented out
      teamId: "2X3976938Y",
      entitlements: {
        "com.apple.developer.applesignin": ["Default"]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.xqfitness.app"
    },
    extra: {
      eas: {
        projectId: "8083ea40-83b9-4181-b677-151380acb2b2"
      },
      gatewayUrl: !process.env.E2E ? process.env.GATEWAY_URL : "http://localhost:8080"
    }
  }
};

