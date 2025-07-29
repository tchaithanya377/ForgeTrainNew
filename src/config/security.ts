// Security Configuration
// This file allows easy switching between development and production security modes

export interface SecurityMode {
  name: string;
  description: string;
  zeroTolerance: boolean;
  immediateTermination: boolean;
  maxViolations: number;
  developmentMode: boolean;
  logToServer: boolean;
}

export const SECURITY_MODES = {
  // Development mode - for testing and development
  DEVELOPMENT: {
    name: 'Development',
    description: 'Security violations are logged but do not terminate the session',
    zeroTolerance: false,
    immediateTermination: false,
    maxViolations: 10,
    developmentMode: true,
    logToServer: false
  },

  // Testing mode - for testing security features
  TESTING: {
    name: 'Testing',
    description: 'Security violations trigger warnings but allow continued testing',
    zeroTolerance: false,
    immediateTermination: false,
    maxViolations: 5,
    developmentMode: true,
    logToServer: false
  },

  // Production mode - full security enforcement with 3 violations threshold
  PRODUCTION: {
    name: 'Production',
    description: 'Three violations allowed before automatic termination',
    zeroTolerance: false,
    immediateTermination: false,
    maxViolations: 3,
    developmentMode: false,
    logToServer: true
  }
};

// Current security mode - change this to switch modes
export const CURRENT_SECURITY_MODE: keyof typeof SECURITY_MODES = 'PRODUCTION';

// Get current security configuration
export const getSecurityConfig = () => {
  return SECURITY_MODES[CURRENT_SECURITY_MODE];
};

// Helper function to check if in development mode
export const isDevelopmentMode = () => {
  return CURRENT_SECURITY_MODE === 'DEVELOPMENT' || CURRENT_SECURITY_MODE === 'TESTING';
};

// Helper function to check if in production mode
export const isProductionMode = () => {
  return CURRENT_SECURITY_MODE === 'PRODUCTION';
};

// Environment-based auto-detection
export const getAutoSecurityMode = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'DEVELOPMENT';
  }
  if (process.env.NODE_ENV === 'test') {
    return 'TESTING';
  }
  return 'PRODUCTION';
};

// Auto-configure based on environment
export const AUTO_SECURITY_MODE = getAutoSecurityMode(); 