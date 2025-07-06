import React from 'react';
import PasswordGenerator from './components/PasswordGenerator';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Password Generator
          </h1>
          <p className="text-gray-600">
            Create secure passwords with customizable options
          </p>
        </div>
        <PasswordGenerator />
      </div>
    </div>
  );
}

export default App;