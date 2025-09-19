import React, { useState } from 'react';
import './App.css';
import SignInForm from './components/SignInForm';
import SignUpForm from './components/SignUpForm';

function App() {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="form-container">
          <div className="header">
            <h1>Team Project</h1>
            <p className="subtitle">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>
          
          {isSignUp ? (
            <SignUpForm onToggleForm={toggleForm} />
          ) : (
            <SignInForm onToggleForm={toggleForm} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
