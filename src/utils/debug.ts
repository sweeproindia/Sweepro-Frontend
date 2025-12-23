export const debugApiCall = async (url: string, options?: RequestInit) => {
  console.group(`🚀 API Call: ${options?.method || 'GET'} ${url}`);
  console.log('Options:', options);
  
  try {
    const response = await fetch(url, options);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    console.groupEnd();
    return { response, data };
  } catch (error) {
    console.error('API Call Error:', error);
    console.groupEnd();
    throw error;
  }
};

export const debugLogin = async (email: string, password: string) => {
  const backendOrigin = (import.meta as any).env?.VITE_BACKEND_ORIGIN || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://sweep-pro-backend-testing.onrender.com');
  const API_BASE_URL = `${backendOrigin}/api`;
  const url = `${API_BASE_URL}/auth/login`;
  
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  };
  
  return debugApiCall(url, options);
};

export const debugBackendConnection = async () => {
  console.group('🔍 Backend Connection Test');
  
  const backendOrigin = (import.meta as any).env?.VITE_BACKEND_ORIGIN || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://sweep-pro-backend-testing.onrender.com');
  const baseUrls = [
    backendOrigin,
    `${backendOrigin}/api`,
  ];
  
  for (const baseUrl of baseUrls) {
    try {
      console.log(`Testing: ${baseUrl}`);
      const response = await fetch(baseUrl);
      console.log(`✅ ${baseUrl} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${baseUrl} - Error:`, error);
    }
  }
  
  console.groupEnd();
};
