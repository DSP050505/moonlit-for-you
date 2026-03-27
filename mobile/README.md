# BetweenUs Mobile (Android)

This is the mobile companion app for the BetweenUs web application, built with Expo and React Native.

## Tech Stack
- **Framework**: Expo (React Native) - Managed Workflow
- **Navigation**: Expo Router v3 (File-based)
- **Styling**: NativeWind v4 (Tailwind CSS)
- **State/Auth**: Expo SecureStore + React Context
- **Real-time**: Socket.io-client

## Getting Started

### 1. Prerequisites
- Install Node.js
- Install [Expo Go](https://expo.dev/expo-go) on your Android device.

### 2. Setup
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your backend URL:
   ```bash
   EXPO_PUBLIC_API_URL=https://your-render-backend.com
   ```

### 3. Run Locally
```bash
npx expo start
```
Scan the QR code with the Expo Go app on your Android device.

## Production Build (Play Store)

### 1. Configure EAS
If you haven't already, install the EAS CLI:
```bash
npm install -g eas-cli
eas login
```

### 2. Build AAB for Play Store
Run the following command to generate a production-ready Android App Bundle:
```bash
eas build -p android --profile production
```
This will generate an `.aab` file that can be uploaded to the Google Play Console.

### 3. Build APK for Testing
To generate a simple APK for manual installation/testing:
```bash
eas build -p android --profile preview
```

## Folder Structure
- `app/`: Expo Router screens and layouts.
- `components/`: Reusable UI components.
- `hooks/`: Custom hooks for Auth and Sockets.
- `constants/`: Design tokens and theme settings.
- `assets/`: App icons and splash screens.

## Notes
- The mobile app uses the same backend and database as the web application.
- Real-time features (Chat, Map) are synced between web and mobile.
