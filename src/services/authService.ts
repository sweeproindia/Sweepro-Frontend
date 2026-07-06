import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse, setAuthToken, removeAuthToken, getAuthToken, getAuthTokenType } from './api';
import { FirebaseAuth } from './firebaseAuth';

export interface User {
  id: string;
  firebase_uid?: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'CUSTOMER' | 'MAID' | 'ADMIN' | null;
  apartment_id: string | null;
  address?: string | null;
  locality?: string | null;
  pincode?: string | null;
  timeSlot?: string | null;
  profile_completed: boolean;
  status: string;
  createdAt: string;
  updatedAt?: string;
  requiresVerification?: boolean;
  isNewUser?: boolean;
  profiles?: {
    customer?: any;
    maid?: any;
    admin?: any;
  };
}

export interface AuthResponse {
  user: User;
  token?: string; // JWT token returned by backend for Google OAuth login
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'MAID';
  password: string;
  confirmPassword: string;
  address: string;
  serviceArea?: string;
  pincode?: string;
}

export interface CompleteProfileData {
  phone: string;
  role: 'CUSTOMER' | 'MAID';
  apartment_id?: string;
  address?: string;
  pincode?: string;
}

export interface Apartment {
  id: string;
  name: string;
  area: string;
  pincode: string;
}

export class AuthService {
  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(intent: 'login' | 'signup' = 'login'): Promise<ApiResponse<AuthResponse>> {
    try {
      // Sign in with Firebase Google OAuth
      const { idToken } = await FirebaseAuth.signInWithGoogle();

      // Call backend to create/update user
      const response = await apiRequest<AuthResponse>(
        '/auth/firebase/login',
        {
          method: HttpMethod.POST,
          body: { idToken, intent },
          requiresAuth: false
        }
      );

      if (response.success && response.data?.user) {
        removeAuthToken();
        localStorage.setItem('authTokenType', 'jwt');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Store the JWT in localStorage for subsequent API calls
        // The backend sets it as a cookie, but we also need it in localStorage
        // for the Authorization header to work correctly
        if (response.data.token) {
          setAuthToken(response.data.token, 'local', 'jwt');
        }
      }

      return response;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      const tokenType = getAuthTokenType();
      const meEndpoint = tokenType === 'firebase' ? '/auth/firebase/me' : API_ENDPOINTS.AUTH.ME;

      // CROSS-ORIGIN FIX: requiresAuth:true sends the JWT from localStorage as
      // Authorization: Bearer header — works cross-origin regardless of cookie SameSite policy.
      const response = await apiRequest<{ user: User }>(meEndpoint, {
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
   * Complete user profile (mandatory onboarding)
   */
  static async completeProfile(profileData: CompleteProfileData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiRequest<AuthResponse>(
        '/auth/firebase/complete-profile',
        {
          method: HttpMethod.POST,
          body: profileData,
          requiresAuth: true
        }
      );

      if (response.success && response.data?.user) {
        removeAuthToken();
        localStorage.setItem('authTokenType', 'jwt');
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Complete profile error:', error);
      throw error;
    }
  }

  /**
   * Get list of available apartments
   */
  static async getApartments(): Promise<ApiResponse<{ apartments: Apartment[] }>> {
    try {
      return await apiRequest<{ apartments: Apartment[] }>(
        API_ENDPOINTS.APARTMENTS,
        {
          method: HttpMethod.GET,
          requiresAuth: false
        }
      );
    } catch (error) {
      console.error('Get apartments error:', error);
      throw error;
    }
  }

  /**
   * Email/password login
   */
  static async login(
    credentials: LoginCredentials,
    rememberMe: boolean = false
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await apiRequest<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: HttpMethod.POST,
        body: { ...credentials, rememberMe },
        requiresAuth: false
      }
    );

    if (response.success && response.data) {
      const { user, token } = response.data;

      if (token) {
        // Store JWT in localStorage
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('authTokenType', 'jwt');
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response;
  }

  /**
   * Email/password registration
   */
  static async register(registerData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiRequest<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: HttpMethod.POST,
        body: registerData,
        requiresAuth: false
      }
    );

    if (response.success && response.data?.user) {
      // M6: JWT is stored in an HttpOnly cookie set by the backend.
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // FIX: Mark this as a JWT session so getCurrentUser() calls /auth/me
      // (not /auth/firebase/me) on future refreshes — same as login().
      localStorage.setItem('authTokenType', 'jwt');
      // FIX: Store JWT for Authorization header auth (cross-origin deployments).
      // Without this, post-registration API calls like /auth/me fail with 401
      // because no token is sent in the Authorization header.
      const token = (response.data as any).token;
      if (token) {
        setAuthToken(token, 'local', 'jwt');
      }
    }

    return response;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    const clearLocal = () => {
      removeAuthToken();
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    };

    // Synchronously burn the local session immediately so the user doesn't get stuck.
    clearLocal();

    try {
      // The API call and Firebase call happen purely in the background.
      // Even if they hang or fail, the frontend is already logged out.
      await Promise.allSettled([
        apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
          method: HttpMethod.POST,
          requiresAuth: true
        }),
        FirebaseAuth.logout()
      ]);
    } catch (error) {
      console.error('Logout error (background):', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    // M6: JWT users no longer store the raw token in localStorage — it lives in an
    // HttpOnly cookie. Use the cached user profile as the client-side auth indicator;
    // actual session validity is enforced server-side on every request.
    const user = localStorage.getItem('user');
    return !!user;
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
   * Get Firebase ID token (for API requests)
   */
  static async getFirebaseIdToken(forceRefresh: boolean = false): Promise<string | null> {
    try {
      const token = await FirebaseAuth.getFirebaseIdToken(forceRefresh);
      if (token) {
        // Update stored token
        setAuthToken(token, 'local', 'firebase');
      }
      return token;
    } catch (error) {
      console.error('Error getting Firebase ID token:', error);
      return null;
    }
  }
}
