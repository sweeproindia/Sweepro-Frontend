import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse, setAuthToken, removeAuthToken } from './api';

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'MAID' | 'ADMIN';
  password: string;
  confirmPassword: string;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  timeSlot?: string;
  role: 'CUSTOMER' | 'MAID' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt?: string;
  profiles?: {
    customer?: any;
    maid?: any;
    admin?: any;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AddressData {
  address?: string;
  pincode?: string;
  locality?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
        method: HttpMethod.POST,
        body: userData,
        requiresAuth: false
      });

      // Store token on successful registration
      if (response.success && response.data?.token) {
        setAuthToken(response.data.token);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        method: HttpMethod.POST,
        body: credentials,
        requiresAuth: false
      });

      // Store token and user data on successful login
      if (response.success && response.data?.token) {
        setAuthToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiRequest<{ user: User }>(API_ENDPOINTS.AUTH.ME, {
        method: HttpMethod.GET,
        requiresAuth: true
      });

      // Update stored user data
      if (response.success && response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    removeAuthToken();
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Update the user's address (and profile) on the backend
   */
  static async updateUserAddress(address: AddressData): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiRequest<{ user: User }>(API_ENDPOINTS.USER.UPDATE, {
        method: HttpMethod.PUT,
        body: address,
        requiresAuth: true,
      });
      if (response.success && response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  /**
   * Update stored user data
   */
  static updateStoredUser(userData: Partial<User>): void {
    const currentUser = this.getStoredUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  /**
   * Check if token is expired (basic check)
   */
  static isTokenExpired(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return true;

    try {
      // Basic JWT payload extraction (without signature verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  /**
   * Refresh authentication status
   */
  static async refreshAuth(): Promise<boolean> {
    if (!this.isAuthenticated() || this.isTokenExpired()) {
      this.logout();
      return false;
    }

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Auth refresh failed:', error);
      this.logout();
      return false;
    }
  }
}
