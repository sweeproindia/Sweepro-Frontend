import { signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface FirebaseAuthResult {
  user: FirebaseUser;
  idToken: string;
}

/**
 * Firebase Authentication Service - Google OAuth Only
 */
export class FirebaseAuth {
  /**
   * Sign in with Google
   */
  static async signInWithGoogle(): Promise<FirebaseAuthResult> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      return {
        user: firebaseUser,
        idToken
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current Firebase user
   */
  static getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Get Firebase ID token
   */
  static async getFirebaseIdToken(forceRefresh: boolean = false): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return null;
      }
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}


