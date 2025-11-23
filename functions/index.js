/**
 * Cloud Functions for Yeni Nesil Sınıf
 * 
 * Main functions:
 * - createBooking: Create booking with overlap prevention
 * - scheduleNotifications: Scheduled function for booking reminders
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Create Booking with Overlap Prevention
 * HTTPS Callable Function
 */
exports.createBooking = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Giriş yapmalısınız');
  }
  
  const studentId = context.auth.uid;
  const { teacherId, subject, startTime, duration, notes } = data;
  
  // Validate input
  if (!teacherId || !subject || !startTime || !duration) {
    throw new functions.https.HttpsError('invalid-argument', 'Eksik bilgi');
  }
  
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  
  try {
    // Get teacher info
    const teacherDoc = await db.collection('users').doc(teacherId).get();
    if (!teacherDoc.exists || teacherDoc.data().role !== 'teacher') {
      throw new functions.https.HttpsError('not-found', 'Öğretmen bulunamadı');
    }
    
    const teacherData = teacherDoc.data();
    
    // Get student info
    const studentDoc = await db.collection('users').doc(studentId).get();
    const studentData = studentDoc.data();
    
    // Check for overlapping bookings using Firestore transaction
    const bookingData = {
      studentId,
      teacherId,
      studentName: studentData.displayName,
      teacherName: teacherData.displayName,
      subject,
      startTime: admin.firestore.Timestamp.fromDate(startDate),
      endTime: admin.firestore.Timestamp.fromDate(endDate),
      duration,
      status: 'confirmed',
      price: teacherData.hourlyRate * (duration / 60),
      notes: notes || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const result = await db.runTransaction(async (transaction) => {
      // Query for overlapping bookings
      const overlappingQuery = db.collection('bookings')
        .where('teacherId', '==', teacherId)
        .where('status', 'in', ['pending', 'confirmed'])
        .where('startTime', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate.getTime() - 2 * 60 * 60 * 1000)))
        .where('startTime', '<=', admin.firestore.Timestamp.fromDate(endDate));
      
      const overlappingSnapshot = await transaction.get(overlappingQuery);
      
      // Check for actual overlaps
      for (const doc of overlappingSnapshot.docs) {
        const existingBooking = doc.data();
        const existingStart = existingBooking.startTime.toDate();
        const existingEnd = existingBooking.endTime.toDate();
        
        // Check if times overlap
        if (
          (startDate >= existingStart && startDate < existingEnd) ||
          (endDate > existingStart && endDate <= existingEnd) ||
          (startDate <= existingStart && endDate >= existingEnd)
        ) {
          throw new functions.https.HttpsError('already-exists', 'Bu zaman diliminde öğretmenin başka randevusu var');
        }
      }
      
      // Create booking
      const bookingRef = db.collection('bookings').doc();
      transaction.set(bookingRef, bookingData);
      
      return { id: bookingRef.id, ...bookingData };
    });
    
    // Create notifications (outside transaction)
    await createBookingNotifications(result.id, studentId, teacherId, teacherData.displayName, startDate);
    
    return { success: true, bookingId: result.id };
    
  } catch (error) {
    console.error('Create booking error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Randevu oluşturulamadı');
  }
});

/**
 * Create notifications for booking
 */
async function createBookingNotifications(bookingId, studentId, teacherId, teacherName, startDate) {
  const batch = db.batch();
  
  // Student notification
  const studentNotifRef = db.collection('notifications').doc();
  batch.set(studentNotifRef, {
    userId: studentId,
    type: 'booking',
    title: 'Randevu Onaylandı',
    message: `${teacherName} ile randevunuz ${startDate.toLocaleDateString('tr-TR')} tarihinde oluşturuldu.`,
    isRead: false,
    link: `/bookings/detail.html?id=${bookingId}`,
    metadata: { bookingId },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  // Teacher notification
  const teacherNotifRef = db.collection('notifications').doc();
  batch.set(teacherNotifRef, {
    userId: teacherId,
    type: 'booking',
    title: 'Yeni Randevu',
    message: `${startDate.toLocaleDateString('tr-TR')} tarihinde yeni bir randevunuz oluşturuldu.`,
    isRead: false,
    link: `/bookings/detail.html?id=${bookingId}`,
    metadata: { bookingId },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  await batch.commit();
}

/**
 * Scheduled Notifications (runs every 30 minutes)
 * Sends reminders for upcoming bookings
 */
exports.scheduleNotifications = functions.pubsub.schedule('every 30 minutes').onRun(async (context) => {
  const now = new Date();
  const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
  const in60Minutes = new Date(now.getTime() + 60 * 60 * 1000);
  
  try {
    // Find bookings starting in next 30-60 minutes
    const upcomingBookings = await db.collection('bookings')
      .where('status', '==', 'confirmed')
      .where('startTime', '>=', admin.firestore.Timestamp.fromDate(in30Minutes))
      .where('startTime', '<=', admin.firestore.Timestamp.fromDate(in60Minutes))
      .get();
    
    const batch = db.batch();
    let notificationCount = 0;
    
    for (const doc of upcomingBookings.docs) {
      const booking = doc.data();
      const bookingId = doc.id;
      
      // Check if reminder already sent
      const existingNotif = await db.collection('notifications')
        .where('userId', '==', booking.studentId)
        .where('metadata.bookingId', '==', bookingId)
        .where('type', '==', 'reminder')
        .limit(1)
        .get();
      
      if (!existingNotif.empty) continue;
      
      // Create reminder for student
      const studentNotifRef = db.collection('notifications').doc();
      batch.set(studentNotifRef, {
        userId: booking.studentId,
        type: 'reminder',
        title: 'Yaklaşan Ders',
        message: `${booking.teacherName} ile dersiniz yaklaşık 30 dakika sonra başlayacak.`,
        isRead: false,
        link: `/bookings/detail.html?id=${bookingId}`,
        metadata: { bookingId },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Create reminder for teacher
      const teacherNotifRef = db.collection('notifications').doc();
      batch.set(teacherNotifRef, {
        userId: booking.teacherId,
        type: 'reminder',
        title: 'Yaklaşan Ders',
        message: `${booking.studentName} ile dersiniz yaklaşık 30 dakika sonra başlayacak.`,
        isRead: false,
        link: `/bookings/detail.html?id=${bookingId}`,
        metadata: { bookingId },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      notificationCount += 2;
    }
    
    if (notificationCount > 0) {
      await batch.commit();
      console.log(`Created ${notificationCount} reminder notifications`);
    }
    
    return null;
  } catch (error) {
    console.error('Schedule notifications error:', error);
    return null;
  }
});
