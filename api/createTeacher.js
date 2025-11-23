// Vercel Serverless Function - Create Teacher Account
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, displayName, phone, bio, subjects, hourlyRate, imageUrl } = req.body;

    // Validation
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, şifre ve ad soyad gerekli' });
    }

    // Create Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    // Create Firestore document
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      phone: phone || '',
      bio: bio || '',
      subjects: subjects || [],
      hourlyRate: parseFloat(hourlyRate) || 0,
      imageUrl: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=EF4444&color=fff&size=200`,
      role: 'teacher',
      isActive: true,
      rating: 0,
      totalReviews: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      message: 'Öğretmen hesabı başarıyla oluşturuldu',
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    
    // Handle specific errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda' });
    }
    
    return res.status(500).json({
      error: error.message || 'Öğretmen hesabı oluşturulurken hata oluştu',
    });
  }
};
