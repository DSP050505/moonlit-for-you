# BetweenUs — Shared World

A digital sanctuary for two. This repository contains both the web application and the mobile companion app.

## Project Structure
- **/client**: React + Vite web application using Framer Motion and Three.js.
- **/server**: Node.js + Express backend with Prisma (Neon DB) and Socket.io.
- **/mobile**: Expo (React Native) mobile app for Android.

## Setup & Running

### Web Application
1. **Server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. **Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Mobile Application
1. **Preparation**:
   ```bash
   cd mobile
   npm install
   ```
2. **Local Development**:
   ```bash
   npx expo start
   ```
   Open the Expo Go app on your Android device and scan the QR code.

## Deployment & Building

### Web
- **Frontend**: Deployed to Vercel/Render.
- **Backend**: Deployed to Render.

### Mobile (Android)
To build a production AAB for the Google Play Store:
```bash
cd mobile
eas build -p android --profile production
```

## Features
- **Real-time Chat**: Shared whispers and moments.
- **Calendar**: Memory timeline for special events.
- **Distance Map**: Real-time tracking of how far apart we are.
- **Love Letters**: Digital vault for heartfelt messages.
- **Games & Surprises**: Interactive fun tailored for us.

---
Built with ❤️ for Rishika & DSP.
