// Testing Configuration
// Control various testing features across the application

export const testingConfig = {
  // Auto-fill DG Operations form on page load
  autoFillDGForm: true,
  
  // Show debug logs in console
  showDebugLogs: true,
  
  // Skip validation for faster testing (not recommended)
  skipValidation: false,
  
  // Auto-login (if implemented in future)
  autoLogin: false,
  
  // Mock API responses (if implemented in future)
  mockAPIResponses: false,
  
  // Reduce delays/timeouts for faster testing
  reducedDelays: true,
} as const

// Helper function to check if testing features are enabled
export const isTestingEnabled = () => {
  return process.env.NODE_ENV === 'development'
}

// Helper to log testing messages
export const testLog = (message: string, ...args: any[]) => {
  if (isTestingEnabled() && testingConfig.showDebugLogs) {
    console.log(`🧪 [TEST] ${message}`, ...args)
  }
}

export default testingConfig
