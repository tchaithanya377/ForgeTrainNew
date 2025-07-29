import React from 'react';
import { SecurityDebugComponent } from '../components/quiz/SecurityDebugComponent';

export const SecurityDebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security System Debug</h1>
          <p className="text-gray-600">
            Test and debug the zero-tolerance anti-cheating system
          </p>
        </div>
        
        <SecurityDebugComponent />
      </div>
    </div>
  );
}; 