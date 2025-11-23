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
  // Firebase Configuration for yeni-nesil-sinif-adm
  const firebaseConfig = {
    apiKey: "AIzaSyAe51HzG6O-xyv6ZlgP9Z9MQWUq4-aQ_kg",
    authDomain: "yeni-nesil-sinif-adm.firebaseapp.com",
    projectId: "yeni-nesil-sinif-adm",
    storageBucket: "yeni-nesil-sinif-adm.firebasestorage.app",
    messagingSenderId: "50832277016",
    appId: "1:50832277016:web:d8b6114a2c99d6ab31cd6d"
  };
  
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
