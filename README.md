# Team Fun - Job Application Tracker

A React Native mobile application for tracking job applications, built with Expo.

## Features

- User signup and authentication with enhanced form controls
- Dropdown selectors for better data entry (majors, companies, roles, industries, locations)
- Target companies management with floating add button
- Job application tracking
- Dashboard with progress analytics
- Resume management
- Sign out functionality

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/calvin-cs262-fall2025-teamF/Client.git
cd Client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running the App

After running `npm start`, you can:

- **On your phone**: Install the Expo Go app and scan the QR code
- **On web**: Press `w` in the terminal or visit the web URL shown
- **On iOS simulator**: Press `i` (requires Xcode)
- **On Android emulator**: Press `a` (requires Android Studio)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/          # App constants and configuration
├── data/              # Static data and mock data
├── navigation/        # Navigation configuration
├── screens/           # Screen components
├── store/             # Redux store and slices
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Technologies Used

- React Native
- Expo
- TypeScript
- Redux Toolkit
- React Navigation
- AsyncStorage
- React Hook Form

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of Calvin University CS 262 coursework.