import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Get Firebase configuration from environment variables
const getFirebaseConfig = (): FirebaseConfig => {
  const config: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  // Validate that all required config values are present
  const missingKeys = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase configuration: ${missingKeys.join(', ')}. ` +
      'Please set the required environment variables in your .env file.'
    );
  }

  return config;
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
  const config = getFirebaseConfig();
  
  // Initialize Firebase only if it hasn't been initialized
  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { app, auth };
export default app;


