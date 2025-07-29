import React from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { getSecurityConfig, SECURITY_MODES, CURRENT_SECURITY_MODE } from '../../config/security';

interface SecurityModeIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const SecurityModeIndicator: React.FC<SecurityModeIndicatorProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const config = getSecurityConfig();
  
  const getModeColor = () => {
    switch (CURRENT_SECURITY_MODE) {
      case 'DEVELOPMENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'TESTING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PRODUCTION':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModeIcon = () => {
    switch (CURRENT_SECURITY_MODE) {
      case 'DEVELOPMENT':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'TESTING':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'PRODUCTION':
        return <LockClosedIcon className="h-4 w-4" />;
      default:
        return <ShieldCheckIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getModeColor()} ${className}`}>
      {getModeIcon()}
      <span>{config.name} Mode</span>
      
      {showDetails && (
        <div className="ml-2 text-xs opacity-75">
          {config.zeroTolerance ? 'Zero Tolerance' : `${config.maxViolations} violations allowed`}
        </div>
      )}
    </div>
  );
};

export const SecurityModeSelector: React.FC = () => {
  const [currentMode, setCurrentMode] = React.useState(CURRENT_SECURITY_MODE);

  const handleModeChange = (mode: keyof typeof SECURITY_MODES) => {
    // In a real app, this would update the global configuration
    setCurrentMode(mode);
    console.log(`Security mode changed to: ${mode}`);
    console.log('Configuration:', SECURITY_MODES[mode]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4 max-w-md">
      <h3 className="font-semibold text-gray-900 mb-3">Security Mode</h3>
      
      <div className="space-y-2">
        {Object.entries(SECURITY_MODES).map(([key, config]) => (
          <label key={key} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="securityMode"
              value={key}
              checked={currentMode === key}
              onChange={() => handleModeChange(key as keyof typeof SECURITY_MODES)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{config.name}</div>
              <div className="text-sm text-gray-600">{config.description}</div>
            </div>
          </label>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-900 mb-1">Current Configuration:</div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Zero Tolerance: {SECURITY_MODES[currentMode].zeroTolerance ? 'Yes' : 'No'}</div>
          <div>Immediate Termination: {SECURITY_MODES[currentMode].immediateTermination ? 'Yes' : 'No'}</div>
          <div>Max Violations: {SECURITY_MODES[currentMode].maxViolations}</div>
          <div>Development Mode: {SECURITY_MODES[currentMode].developmentMode ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
}; 