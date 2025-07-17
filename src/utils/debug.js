// Debug utilities for FloatingNexie component
export const debugLog = (component, message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${component}: ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
};

export const debugError = (component, error, context = null) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${component} ERROR:`, error);
    if (context) {
      console.error('Context:', context);
    }
  }
};
