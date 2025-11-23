/**
 * Firebase Client Library
 * Initializes Firebase services and exports helper functions
 * 
 * Note: This uses Firebase SDK v9+ (modular approach via CDN)
 * Config is loaded from firebase-config.js which reads from environment
 */

// Firebase will be initialized after config is loaded
let auth, db, storage, functions;

/**
 * Initialize Firebase with config
 * Called automatically when firebase-config.js is loaded
 */
window.initializeFirebase = function(config) {
  if (!window.firebase) {
    console.error('Firebase SDK not loaded. Please include Firebase CDN scripts.');
    return;
  }
  
  try {
    // Initialize Firebase
    const app = firebase.initializeApp(config);
    
    // Get service instances
    auth = firebase.auth(app);
    db = firebase.firestore(app);
    storage = firebase.storage ? firebase.storage(app) : null;
    
    // Enable Firestore offline persistence
    db.enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
        console.warn('Firestore persistence error:', err.code);
      });
    
    console.log('✅ Firebase initialized successfully');
    
    // Export globally
    window.firebase.auth = () => auth;
    window.firebase.firestore = () => db;
    window.firebase.storage = () => storage;
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

/**
 * Auth Helpers
 */

// Register with email and password
async function registerUser(email, password, displayName) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update profile
    await user.updateProfile({ displayName });
    
    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: displayName,
      role: 'student', // Default role
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login with email and password
async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout
async function logoutUser() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Get current user
function getCurrentUser() {
  return auth.currentUser;
}

// Get user role from Firestore
async function getUserRole(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? doc.data().role : null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Firestore Helpers
 */

// Get document by ID
async function getDocument(collection, docId) {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error(`Error fetching document ${collection}/${docId}:`, error);
    throw error;
  }
}

// Get collection with optional query
async function getCollection(collection, queryFn = null) {
  try {
    let ref = db.collection(collection);
    if (queryFn) {
      ref = queryFn(ref);
    }
    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching collection ${collection}:`, error);
    throw error;
  }
}

// Add document
async function addDocument(collection, data) {
  try {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collection}:`, error);
    throw error;
  }
}

// Update document
async function updateDocument(collection, docId, data) {
  try {
    await db.collection(collection).doc(docId).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document ${collection}/${docId}:`, error);
    throw error;
  }
}

// Delete document
async function deleteDocument(collection, docId) {
  try {
    await db.collection(collection).doc(docId).delete();
  } catch (error) {
    console.error(`Error deleting document ${collection}/${docId}:`, error);
    throw error;
  }
}

// Listen to document changes
function listenToDocument(collection, docId, callback) {
  return db.collection(collection).doc(docId).onSnapshot(
    (doc) => {
      if (doc.exists) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Error listening to document ${collection}/${docId}:`, error);
    }
  );
}

// Listen to collection changes
function listenToCollection(collection, callback, queryFn = null) {
  let ref = db.collection(collection);
  if (queryFn) {
    ref = queryFn(ref);
  }
  
  return ref.onSnapshot(
    (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(docs);
    },
    (error) => {
      console.error(`Error listening to collection ${collection}:`, error);
    }
  );
}

/**
 * Storage Helpers
 */

// Upload file
async function uploadFile(path, file, metadata = {}) {
  try {
    const storageRef = storage.ref(path);
    const snapshot = await storageRef.put(file, metadata);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return { url: downloadURL, metadata: snapshot.metadata };
  } catch (error) {
    console.error(`Error uploading file to ${path}:`, error);
    throw error;
  }
}

// Delete file
async function deleteFile(path) {
  try {
    const storageRef = storage.ref(path);
    await storageRef.delete();
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error);
    throw error;
  }
}

// Get download URL
async function getFileURL(path) {
  try {
    const storageRef = storage.ref(path);
    return await storageRef.getDownloadURL();
  } catch (error) {
    console.error(`Error getting URL for ${path}:`, error);
    throw error;
  }
}

/**
 * Export all helpers
 */
window.firebaseHelpers = {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserRole,
  
  // Firestore
  getDocument,
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  listenToDocument,
  listenToCollection,
  
  // Storage
  uploadFile,
  deleteFile,
  getFileURL,
  
  // Direct access to services (use with caution)
  get auth() { return auth; },
  get db() { return db; },
  get storage() { return storage; },
};

// Export for convenience
window.fb = window.firebaseHelpers;
