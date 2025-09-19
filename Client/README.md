# Team Project Client

A simple React TypeScript client application with sign up/sign in functionality.

## Features

- Modern, responsive UI with gradient background
- Sign in form with email and password
- Sign up form with first name, last name, email, and password
- Form validation and error handling
- Loading states for better UX
- Clean, professional design

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the Client directory:
```bash
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

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
Client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── SignInForm.tsx
│   │   └── SignUpForm.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Contributing

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes and test them locally
3. Commit your changes: `git commit -m "Add your feature description"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Create a Pull Request for review

### Code Style

- Use TypeScript for all new components
- Follow React functional component patterns
- Use meaningful variable and function names
- Add comments for complex logic

## Next Steps

This is a basic client application foundation. Future development should include:

1. Backend API integration for authentication
2. State management (Redux, Context API, or Zustand)
3. Protected routes and user session management
4. Additional pages and functionality
5. Testing setup
6. Error boundary implementation

## Technologies Used

- React 18
- TypeScript
- CSS3 with modern features
- Create React App
