const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://debt-optimizer.onrender.com');

// Session management
const SESSION_STORAGE_KEY = 'pathlight_session_id';

export const getSessionId = (): string | null => {
  return sessionStorage.getItem(SESSION_STORAGE_KEY);
};

export const setSessionId = (sessionId: string): void => {
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
};

export const clearSessionId = (): void => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

// API request wrapper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const sessionId = getSessionId();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (sessionId && !endpoint.includes('/api/session')) {
    headers['X-Session-Id'] = sessionId;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Network Error',
        message: `Request failed with status ${response.status}`,
      }));
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors (backend not running, CORS, etc.)
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      const isProduction = API_BASE_URL.includes('https://');
      const errorMessage = isProduction
        ? `Failed to connect to backend at ${API_BASE_URL}. Please ensure the backend server is running and accessible.`
        : `Failed to connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`;
      throw new Error(errorMessage);
    }
    // Re-throw other errors
    throw error;
  }
}

// Session API
export const sessionApi = {
  create: async (): Promise<{ sessionId: string; message: string }> => {
    const result = await apiRequest<{ sessionId: string; message: string }>(
      '/api/session',
      { method: 'POST' }
    );
    setSessionId(result.sessionId);
    return result;
  },
  get: async (sessionId: string): Promise<any> => {
    return apiRequest(`/api/session/${sessionId}`);
  },
};

// Financial Context API
export const financialContextApi = {
  save: async (context: any): Promise<any> => {
    return apiRequest('/api/financial-context', {
      method: 'POST',
      body: JSON.stringify(context),
    });
  },
  get: async (): Promise<{ financialContext: any }> => {
    return apiRequest('/api/financial-context');
  },
};

// Debts API
export const debtsApi = {
  getAll: async (): Promise<{ debts: any[]; aggregation: any }> => {
    return apiRequest('/api/debts');
  },
  add: async (debt: any): Promise<any> => {
    return apiRequest('/api/debts', {
      method: 'POST',
      body: JSON.stringify(debt),
    });
  },
  update: async (id: string, debt: any): Promise<any> => {
    return apiRequest(`/api/debts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(debt),
    });
  },
  delete: async (id: string): Promise<any> => {
    return apiRequest(`/api/debts/${id}`, {
      method: 'DELETE',
    });
  },
  uploadCSV: async (file: File): Promise<any> => {
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error('No session found. Please refresh the page.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/debts/upload`, {
      method: 'POST',
      headers: {
        'X-Session-Id': sessionId,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Network Error',
        message: `Upload failed with status ${response.status}`,
      }));
      throw new Error(error.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  },
};

// Payoff API
export const payoffApi = {
  simulate: async (params: {
    strategy: 'avalanche' | 'snowball' | 'custom';
    monthlyPayment: number;
  }): Promise<any> => {
    return apiRequest('/api/payoff/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// Recommendations API
export const recommendationsApi = {
  getAll: async (): Promise<{ recommendations: any[]; count: number }> => {
    return apiRequest('/api/recommendations');
  },
};

// Charts API
export const chartsApi = {
  getData: async (params?: {
    strategy?: string;
    monthlyPayment?: number;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.strategy) queryParams.append('strategy', params.strategy);
    if (params?.monthlyPayment)
      queryParams.append('monthlyPayment', params.monthlyPayment.toString());

    const query = queryParams.toString();
    return apiRequest(`/api/charts/data${query ? `?${query}` : ''}`);
  },
};

// AI Guidance API
export const aiApi = {
  getGuidance: async (params: {
    action?: string;
    scenario?: any;
  }): Promise<{ guidance: string; timestamp: string }> => {
    return apiRequest('/api/ai/guidance', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// Demo API
export const demoApi = {
  load: async (): Promise<any> => {
    return apiRequest('/api/demo/load', {
      method: 'POST',
    });
  },
};

// Analytics API
// Analytics tracking should never throw errors - failures should be silent
export const analyticsApi = {
  track: async (eventType: string, eventData?: any): Promise<any> => {
    try {
      return await apiRequest('/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ eventType, eventData }),
      });
    } catch (error) {
      // Silently fail analytics - don't interrupt user experience
      // Analytics failures should not affect app functionality
      return null;
    }
  },
  getSession: async (): Promise<any> => {
    try {
      return await apiRequest('/api/analytics/session');
    } catch (error) {
      // Silently fail analytics
      return null;
    }
  },
};

