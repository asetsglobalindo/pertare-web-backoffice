// Simple debug logging functions instead of interceptors
export const debugRequest = (method: string, url: string, params?: any, data?: any) => {
  console.log('API Request:', {
    method: method.toUpperCase(),
    url,
    params,
    data,
    timestamp: new Date().toISOString()
  });
};

export const debugResponse = (url: string, response: any) => {
  console.log('API Response:', {
    url,
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    timestamp: new Date().toISOString()
  });
};

export const debugError = (url: string, error: any) => {
  console.error('API Error:', {
    url,
    status: error.response?.status,
    statusText: error.response?.statusText,
    message: error.response?.data?.message || error.message,
    data: error.response?.data,
    timestamp: new Date().toISOString()
  });
};

// Setup function is now just a console log
export const setupDebugInterceptors = () => {
  console.log('Debug logging functions ready');
};

export default setupDebugInterceptors;