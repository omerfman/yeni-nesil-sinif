/**
 * Firebase Configuration Loader
 * Loads Firebase config from environment variables or build-time injection
 * 
 * For static sites on Vercel:
 * - Environment variables starting with NEXT_PUBLIC_ are exposed to client
 * - This script reads them and initializes Firebase
 * 
 * Usage: Include this BEFORE firebase.js in your HTML
 * <script src="/assets/js/lib/firebase-config.js"></script>
 * <script src="/assets/js/lib/firebase.js"></script>
 */

(function() {
  // Try to read from environment variables (if build process injects them)
  // Otherwise, use placeholder values that user must replace
  const firebaseConfig = {
    apiKey: typeof FIREBASE_API_KEY !== 'undefined' ? FIREBASE_API_KEY : 'YOUR_API_KEY_HERE',
    authDomain: typeof FIREBASE_AUTH_DOMAIN !== 'undefined' ? FIREBASE_AUTH_DOMAIN : 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: typeof FIREBASE_PROJECT_ID !== 'undefined' ? FIREBASE_PROJECT_ID : 'YOUR_PROJECT_ID',
    storageBucket: typeof FIREBASE_STORAGE_BUCKET !== 'undefined' ? FIREBASE_STORAGE_BUCKET : 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: typeof FIREBASE_MESSAGING_SENDER_ID !== 'undefined' ? FIREBASE_MESSAGING_SENDER_ID : 'YOUR_SENDER_ID',
    appId: typeof FIREBASE_APP_ID !== 'undefined' ? FIREBASE_APP_ID : 'YOUR_APP_ID',
  };
  
  // Check if valid config
  if (firebaseConfig.apiKey === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️ Firebase config not set. Please update firebase-config.js or set environment variables.');
    console.warn('See .env.local.example for required variables.');
  }
  
  // Store config globally for firebase.js to use
  window.FIREBASE_CONFIG = firebaseConfig;
  
  // If Firebase SDK is already loaded, initialize immediately
  if (window.firebase && window.initializeFirebase) {
    window.initializeFirebase(firebaseConfig);
  } else {
    // Otherwise wait for Firebase SDK to load
    window.addEventListener('DOMContentLoaded', () => {
      if (window.firebase && window.initializeFirebase) {
        window.initializeFirebase(firebaseConfig);
      }
    });
  }
})();
