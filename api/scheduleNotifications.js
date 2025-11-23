// Vercel Cron Job - Schedule Notifications (runs every 30 minutes)
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

const db = admin.firestore();

module.exports = async (req, res) => {
  // Verify cron secret (security)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const in30Min = new Date(now.getTime() + 30 * 60 * 1000);
    const in60Min = new Date(now.getTime() + 60 * 60 * 1000);

    // Find bookings starting in 30-60 minutes
    const upcomingBookings = await db
      .collection('bookings')
      .where('status', '==', 'confirmed')
      .where('date', '>=', now.toISOString().split('T')[0])
      .get();

    const notifications = [];

    for (const doc of upcomingBookings.docs) {
      const booking = doc.data();
      const bookingDateTime = new Date(`${booking.date}T${booking.timeSlot}`);

      // Check if booking is in 30-60 min window
      if (bookingDateTime >= in30Min && bookingDateTime <= in60Min) {
        // Notification for teacher
        notifications.push({
          userId: booking.teacherId,
          type: 'booking_reminder',
          title: 'Yaklaşan Ders',
          message: `${booking.timeSlot} için dersiniz yaklaşıyor.`,
          bookingId: doc.id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Notification for student
        notifications.push({
          userId: booking.studentId,
          type: 'booking_reminder',
          title: 'Yaklaşan Ders',
          message: `${booking.timeSlot} için dersiniz yaklaşıyor.`,
          bookingId: doc.id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // Batch write notifications
    const batch = db.batch();
    notifications.forEach((notif) => {
      const ref = db.collection('notifications').doc();
      batch.set(ref, notif);
    });

    await batch.commit();

    return res.status(200).json({
      success: true,
      notificationsCreated: notifications.length,
    });
  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
};
