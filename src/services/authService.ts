import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse, setAuthToken, removeAuthToken, BACKEND_ORIGIN, getAuthToken } from './api';


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
  private static getStorageForExistingUser(): Storage {
    return localStorage.getItem('user') ? localStorage : sessionStorage;
  }

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
  static async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('🔑 AuthService: Starting login process');
      const response = await apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        method: HttpMethod.POST,
        body: { ...credentials, rememberMe } as any,
        requiresAuth: false
      });

      console.log('🔑 AuthService: Login API response received');
      
      // Store token and user data on successful login
      if (response.success && response.data?.token) {
        console.log('🔑 AuthService: Storing token and user data');
        // Ensure we don't keep stale auth data in the other storage.
        removeAuthToken();
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');

        const storage = rememberMe ? localStorage : sessionStorage;
        setAuthToken(response.data.token, rememberMe ? 'local' : 'session');
        storage.setItem('user', JSON.stringify(response.data.user));
        console.log('🔑 AuthService: Login successful, data stored');
      }

      return response;
    } catch (error) {
      console.error('🔑 AuthService: Login failed:', error);
      
      // Provide better error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Unable to connect to server')) {
          throw new Error(`Cannot connect to server. Please ensure the backend is reachable at ${BACKEND_ORIGIN}`);
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error - please check your internet connection and ensure the backend server is running');
        }
      }
      
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
        const storage = this.getStorageForExistingUser();
        storage.setItem('user', JSON.stringify(response.data.user));
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
    sessionStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = getAuthToken();
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return !!(token && user);
  }


  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
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
      const storage = this.getStorageForExistingUser();
      storage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  /**
   * Check if token is expired (basic check)
   */
  static isTokenExpired(): boolean {
    const token = getAuthToken();
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

  /**
   * Update user's main address (consolidates fields into address string)
   */
  static async updateUserAddress(address: AddressData & { timeSlot?: string }): Promise<ApiResponse<{ user: User }>> {
    try {
      const parts = [address.addressLine, address.locality, address.city, address.state, address.pincode, address.landmark]
        .filter((p) => typeof p === 'string' && p && String(p).trim().length > 0) as string[];
      const fullAddress = (address.address && address.address.trim().length > 0) ? address.address : parts.join(', ');
      const body: any = { address: fullAddress };
      if ((address as any).timeSlot) {
        body.timeSlot = (address as any).timeSlot;
      }
      return await apiRequest<{ user: User }>(API_ENDPOINTS.USER.PROFILE, {
        method: HttpMethod.PUT,
        body,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  }
}
