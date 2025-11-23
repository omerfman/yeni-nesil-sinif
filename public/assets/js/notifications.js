/**
 * Notifications Module
 * Handles loading and displaying user notifications
 */

/**
 * Load notifications for current user
 */
async function loadNotifications(userId) {
  const container = document.getElementById('notifications-list');
  if (!container) return;
  
  try {
    const db = window.fb.db;
    
    // Listen to notifications in real-time
    const unsubscribe = db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
          container.innerHTML = `
            <div class="empty-state">
              <p>Henüz bildiriminiz yok</p>
            </div>
          `;
          updateNotificationBadge(0);
          return;
        }
        
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const unreadCount = notifications.filter(n => !n.isRead).length;
        
        updateNotificationBadge(unreadCount);
        container.innerHTML = notifications.map(notif => renderNotification(notif)).join('');
        
        // Add click handlers
        notifications.forEach(notif => {
          const element = document.getElementById(`notif-${notif.id}`);
          if (element && !notif.isRead) {
            element.addEventListener('click', () => markAsRead(notif.id));
          }
        });
      });
    
    // Store unsubscribe function
    window._notificationsUnsubscribe = unsubscribe;
    
  } catch (error) {
    console.error('Error loading notifications:', error);
    container.innerHTML = '<p class="text-error">Bildirimler yüklenirken hata oluştu</p>';
  }
}

/**
 * Render a single notification
 */
function renderNotification(notif) {
  const time = notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date();
  const timeAgo = getTimeAgo(time);
  const readClass = notif.isRead ? 'notification-read' : 'notification-unread';
  
  const icon = {
    'booking': '📅',
    'assignment': '📝',
    'reminder': '🔔',
    'system': 'ℹ️'
  }[notif.type] || '📬';
  
  return `
    <div class="notification-item ${readClass}" id="notif-${notif.id}" ${notif.link ? `onclick="window.location.href='${notif.link}'"` : ''}>
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <h4>${notif.title}</h4>
        <p>${notif.message}</p>
        <span class="notification-time">${timeAgo}</span>
      </div>
      ${!notif.isRead ? '<div class="notification-indicator"></div>' : ''}
    </div>
  `;
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
  try {
    const db = window.fb.db;
    await db.collection('notifications').doc(notificationId).update({
      isRead: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead(userId) {
  try {
    const db = window.fb.db;
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
    window.app.showToast('Tüm bildirimler okundu olarak işaretlendi', 'success');
    
  } catch (error) {
    console.error('Error marking all as read:', error);
    window.app.showToast('Bir hata oluştu', 'error');
  }
}

/**
 * Update notification badge in header
 */
function updateNotificationBadge(count) {
  const badge = document.getElementById('notification-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
  
  // Update app state
  if (window.app) {
    window.app.notificationCount = count;
  }
}

/**
 * Get relative time string
 */
function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Az önce';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
  
  return date.toLocaleDateString('tr-TR');
}

// Export
window.notificationsModule = {
  loadNotifications,
  markAllAsRead,
};
