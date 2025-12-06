# XQ Fitness Mobile App

React Native mobile application for tracking workout routines.

## Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

3. Update API URLs in `src/services/api.js`:
   - For iOS Simulator: use `http://localhost:8080` and `http://localhost:3000`
   - For Android Emulator: use `http://10.0.2.2:8080` and `http://10.0.2.2:3000`
   - For physical device: use your computer's IP address (e.g., `http://192.168.1.100:8080`)

4. Make sure both backend services (read and write) are running

5. Start the app:
```bash
# Start Expo dev server
npm start

# Or start directly on iOS
npm run ios

# Or start directly on Android
npm run android
```

## Features

### Routine Management
- View all workout routines
- Create new routines
- Edit existing routines
- Delete routines
- Mark routines as active/inactive

### Workout Day Management
- Add workout days to routines
- Edit workout day details
- Delete workout days
- Set day number and name
- Add notes for each day

### Muscle Group & Sets Configuration
- Select muscle groups for each workout day
- Configure number of sets per muscle group
- View all configured sets per day
- Update or remove muscle group configurations

## App Structure

```
mobile/
├── src/
│   ├── navigation/      # React Navigation setup
│   ├── screens/         # All app screens
│   ├── services/        # API service layer
│   └── styles/          # Common styles and theme
├── App.js              # Main app component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Screens

1. **RoutineListScreen** - Browse all workout routines
2. **RoutineDetailScreen** - View routine details and workout days
3. **CreateRoutineScreen** - Create a new routine
4. **EditRoutineScreen** - Edit an existing routine
5. **ManageWorkoutDayScreen** - Create/edit workout days and configure sets

## Testing

The app includes comprehensive testing setup:

### Component Tests
```bash
npm test              # Run all component tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```


## Notes

- The app uses React Navigation for screen navigation
- API calls are made to separate read and write microservices
- All data is stored in PostgreSQL via the backend services
- The app requires active network connection to function
- Comprehensive test suite with 34 component tests and Detox E2E tests


## Useful commands:
`xcrun xctrace list devices` list devices
`ios-deploy --id <DEVICE_UDID> --bundle <PATH_TO_IPA>` deploy ipa to device