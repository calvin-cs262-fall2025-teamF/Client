# Client - React Native Expo App

A React Native application built with Expo featuring user signup, job tracking, resume tailoring, and company targeting functionality.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Expo CLI
- Git

## Installation & Setup

### For New Users (First Time Setup)

1. **Clone the repository**
   ```bash
   git clone https://github.com/calvin-cs262-fall2025-teamF/Client.git
   cd Client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally (if not already installed)**
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### For Existing Contributors (Updating Your Local Copy)

1. **Navigate to your project directory**
   ```bash
   cd Client
   ```

2. **Pull the latest changes from the repository**
   ```bash
   git pull origin master
   ```

3. **Install any new dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android device/emulator
- `npm run ios` - Start the app on iOS device/simulator
- `npm run web` - Start the app in web browser

## Running the App

1. After running `npm start`, a QR code will appear in your terminal
2. Install the Expo Go app on your mobile device
3. Scan the QR code with your device's camera (iOS) or the Expo Go app (Android)
4. The app will load on your device

Alternatively, you can:
- Press `a` to run on Android emulator
- Press `i` to run on iOS simulator
- Press `w` to run in web browser

## Project Structure

```
src/
├── components/         # Reusable UI components
├── screens/           # Application screens
├── navigation/        # Navigation configuration
├── store/            # Redux store and slices
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
├── constants/        # Application constants
└── data/             # Static data files
```

## Features

- User authentication (signup/login)
- Job tracking dashboard
- Resume tailoring functionality
- Company targeting system
- Navigation with bottom tabs
- State management with Redux Toolkit

- Synced by @kbaah on 20251025


## Related Repositories
- [Project](https://github.com/calvin-cs262-fall2025-teamF/Project)
- [Poros Data Service](https://github.com/calvin-cs262-fall2025-teamF/poros_data_service)
