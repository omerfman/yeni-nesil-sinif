// Vercel Serverless Function - Create Booking with Overlap Check
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teacherId, studentId, date, timeSlot, subject, notes } = req.body;

    // Validation
    if (!teacherId || !studentId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Transaction to prevent overlap
    const bookingRef = db.collection('bookings').doc();
    
    await db.runTransaction(async (transaction) => {
      // Check for overlapping bookings
      const overlappingBookings = await db
        .collection('bookings')
        .where('teacherId', '==', teacherId)
        .where('date', '==', date)
        .where('timeSlot', '==', timeSlot)
        .where('status', 'in', ['pending', 'confirmed'])
        .get();

      if (!overlappingBookings.empty) {
        throw new Error('Bu zaman dilimi dolu');
      }

      // Create booking
      const bookingData = {
        teacherId,
        studentId,
        date,
        timeSlot,
        subject: subject || '',
        notes: notes || '',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.set(bookingRef, bookingData);

      // Create notification for teacher
      const notificationRef = db.collection('notifications').doc();
      transaction.set(notificationRef, {
        userId: teacherId,
        type: 'new_booking',
        title: 'Yeni Randevu Talebi',
        message: `${timeSlot} için yeni bir randevu talebi aldınız.`,
        bookingId: bookingRef.id,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.status(200).json({
      success: true,
      bookingId: bookingRef.id,
      message: 'Randevu başarıyla oluşturuldu',
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({
      error: error.message || 'Randevu oluşturulurken hata oluştu',
    });
  }
};
