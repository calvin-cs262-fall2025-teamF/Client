// API Service for connecting to poros-data-service backend
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://poros-data-service.vercel.app';
const TOKEN_STORAGE_KEY = 'auth_token';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      console.log('[API] ✅ Token stored successfully');
    } catch (error) {
      console.error('[API] ❌ Error storing token:', error);
    }
  }

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Debug logging (remove in production)
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      console.log(`[API] Full URL: ${this.baseURL}${endpoint}`);
      if (options.body) {
        console.log('[API] Request body:', options.body);
      }
      if (token) {
        console.log('[API] Token included:', token.substring(0, 20) + '...');
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      // Debug logging
      if (!response.ok) {
        console.error(`[API] Error ${response.status} for ${options.method || 'GET'} ${endpoint}:`, JSON.stringify(data, null, 2));
        console.error(`[API] Full URL that failed: ${url}`);
      } else {
        console.log('[API] Success:', endpoint);
      }

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg).join(', ');
          return {
            error: errorMessages || data.message || data.error || `HTTP error! status: ${response.status}`,
          };
        }
        return {
          error: data.message || data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.token) {
      await this.setToken(response.data.token);
    }
    
    return response;
  }

  async loginByName(name: string) {
    const response = await this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    
    if (response.data?.token) {
      await this.setToken(response.data.token);
    }
    
    return response;
  }

  async signup(userData: any) {
    const response = await this.request<{ token: string; user: any }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.data?.token) {
      await this.setToken(response.data.token);
    }
    
    return response;
  }

  // User endpoints
  async getUser(userId: string) {
    return this.request(`/api/users/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<any>) {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserTargets(userId: string, targets: { targetCompanies?: string[]; targetRoles?: string[]; targetIndustries?: string[]; targetLocations?: string[] }) {
    return this.request(`/api/users/${userId}/targets`, {
      method: 'PUT',
      body: JSON.stringify(targets),
    });
  }

  // Applications endpoints
  // Note: userId is not needed in URL - backend gets it from JWT token
  async getApplications(userId: string) {
    return this.request(`/api/applications`);
  }

  async createApplication(userId: string, application: any) {
    return this.request(`/api/applications`, {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async updateApplication(userId: string, applicationId: string, application: any) {
    return this.request(`/api/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify(application),
    });
  }

  async deleteApplication(userId: string, applicationId: string) {
    return this.request(`/api/applications/${applicationId}`, {
      method: 'DELETE',
    });
  }

  // Resume endpoints
  // Note: userId is not needed in URL - backend gets it from JWT token
  async getResumes(userId: string) {
    return this.request(`/api/resumes`);
  }

  async createResume(userId: string, resume: any) {
    return this.request(`/api/resumes`, {
      method: 'POST',
      body: JSON.stringify(resume),
    });
  }

  async updateResume(userId: string, resumeId: string, resume: any) {
    return this.request(`/api/resumes/${resumeId}`, {
      method: 'PUT',
      body: JSON.stringify(resume),
    });
  }

  async deleteResume(userId: string, resumeId: string) {
    return this.request(`/api/resumes/${resumeId}`, {
      method: 'DELETE',
    });
  }

  // Sync all applications for a user (not used - individual endpoints are used instead)
  async syncApplications(userId: string, applications: any[]) {
    return this.request(`/api/applications/sync`, {
      method: 'POST',
      body: JSON.stringify({ applications }),
    });
  }

  // Sync all resumes for a user (not used - individual endpoints are used instead)
  async syncResumes(userId: string, resumes: any[]) {
    return this.request(`/api/resumes/sync`, {
      method: 'POST',
      body: JSON.stringify({ resumes }),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;


