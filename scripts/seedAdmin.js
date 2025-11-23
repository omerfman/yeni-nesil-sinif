/**
 * Admin Seed Script
 * Creates an admin user from INITIAL_ADMIN_EMAIL environment variable
 * 
 * Usage:
 * 1. Make sure you have .env.local file with FIREBASE_SERVICE_ACCOUNT and INITIAL_ADMIN_EMAIL
 * 2. cd scripts
 * 3. npm install
 * 4. npm run seed-admin
 */

require('dotenv').config({ path: '../.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    // Try to load service account from file path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountPath) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT not found in .env.local');
      console.log('\n📋 Steps to fix:');
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
      console.log('2. Click "Generate New Private Key"');
      console.log('3. Save the JSON file to your project');
      console.log('4. Add FIREBASE_SERVICE_ACCOUNT=/path/to/service-account.json to .env.local');
      process.exit(1);
    }
    
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('✅ Firebase Admin initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    return false;
  }
}

// Create admin user
async function createAdminUser() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('❌ INITIAL_ADMIN_EMAIL not found in .env.local');
    console.log('Add INITIAL_ADMIN_EMAIL=your-email@example.com to .env.local');
    process.exit(1);
  }
  
  try {
    const db = admin.firestore();
    
    // Check if user exists by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`⚠️  No user found with email: ${adminEmail}`);
      console.log('User must register first through the web interface.');
      console.log('After registration, run this script again to grant admin role.');
      process.exit(0);
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    // Update user role to admin
    await db.collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('👤 Name:', userData.displayName || 'N/A');
    console.log('🔑 User ID:', userId);
    console.log('👑 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting admin seed script...\n');
  
  if (!initializeFirebase()) {
    process.exit(1);
  }
  
  await createAdminUser();
  
  console.log('\n✅ Admin seed completed!');
  process.exit(0);
}

main();
