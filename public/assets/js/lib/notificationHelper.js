/**
 * Notification Helper
 * Event-based notification system (no cron needed)
 */

/**
 * Create a notification for a user
 * @param {string} userId - Target user ID
 * @param {string} type - Notification type
 * @param {object} data - Notification data (message, relatedId)
 */
async function createNotification(userId, type, data) {
  const titles = {
    'booking_created': 'Yeni Ders Talebi',
    'booking_confirmed': 'Randevu Onaylandı',
    'booking_cancelled': 'Randevu İptal Edildi',
    'assignment_created': 'Yeni Ödev',
    'assignment_submitted': 'Ödev Teslim Edildi',
    'meeting_link_added': 'Toplantı Linki Eklendi'
  };

  try {
    await window.fb.db.collection('notifications').add({
      userId,
      type,
      title: titles[type] || 'Bildirim',
      message: data.message || '',
      relatedId: data.relatedId || null,
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Notification create error:', error);
  }
}

// Export for global use
window.createNotification = createNotification;
