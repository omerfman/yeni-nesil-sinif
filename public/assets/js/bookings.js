/**
 * Bookings Module
 * Handles booking creation, listing, and management
 */

/**
 * Create a booking (calls Cloud Function to prevent overlaps)
 */
async function createBooking(bookingData) {
  try {
    // Call Vercel Serverless Function (FREE!)
    const response = await fetch('/api/createBooking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Randevu oluşturulamadı');
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
}

/**
 * Load user's bookings
 */
async function loadMyBookings(userId) {
  const container = document.getElementById('bookings-list');
  if (!container) return;
  
  try {
    container.innerHTML = '<p>Yükleniyor...</p>';
    
    const db = window.fb.db;
    
    // Get user role to determine which bookings to show
    const role = await window.fb.getUserRole(userId);
    
    let query;
    if (role === 'teacher') {
      query = db.collection('bookings').where('teacherId', '==', userId);
    } else {
      query = db.collection('bookings').where('studentId', '==', userId);
    }
    
    const snapshot = await query.orderBy('startTime', 'desc').get();
    
    if (snapshot.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Henüz randevunuz bulunmuyor.</p>
          <a href="/teachers/index.html" class="btn btn-primary">Öğretmen Ara</a>
        </div>
      `;
      return;
    }
    
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    container.innerHTML = bookings.map(booking => renderBookingCard(booking, role)).join('');
    
  } catch (error) {
    console.error('Error loading bookings:', error);
    container.innerHTML = '<p class="text-error">Randevular yüklenirken hata oluştu</p>';
  }
}

/**
 * Render booking card
 */
function renderBookingCard(booking, userRole) {
  const startTime = booking.startTime?.toDate ? booking.startTime.toDate() : new Date(booking.startTime);
  const displayName = userRole === 'teacher' ? booking.studentName : booking.teacherName;
  const statusClass = {
    'pending': 'status-pending',
    'confirmed': 'status-confirmed',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }[booking.status] || '';
  
  const statusText = {
    'pending': 'Beklemede',
    'confirmed': 'Onaylandı',
    'completed': 'Tamamlandı',
    'cancelled': 'İptal Edildi'
  }[booking.status] || booking.status;
  
  return `
    <div class="booking-card ${statusClass}">
      <div class="booking-header">
        <div>
          <h3>${displayName}</h3>
          <p class="booking-subject">${booking.subject}</p>
        </div>
        <span class="booking-status">${statusText}</span>
      </div>
      <div class="booking-details">
        <p><strong>Tarih:</strong> ${window.app.formatDate(startTime)}</p>
        <p><strong>Süre:</strong> ${booking.duration} dakika</p>
        <p><strong>Ücret:</strong> ${window.app.formatCurrency(booking.price)}</p>
        ${booking.meetingLink ? `<p><strong>Link:</strong> <a href="${booking.meetingLink}" target="_blank">Derse Katıl</a></p>` : ''}
      </div>
      <div class="booking-actions">
        <a href="/bookings/detail.html?id=${booking.id}" class="btn btn-sm btn-outline">Detay</a>
      </div>
    </div>
  `;
}

/**
 * Load booking detail
 */
async function loadBookingDetail(bookingId) {
  const container = document.getElementById('booking-detail-container');
  if (!container) return;
  
  try {
    const db = window.fb.db;
    const doc = await db.collection('bookings').doc(bookingId).get();
    
    if (!doc.exists) {
      container.innerHTML = '<div class="empty-state"><p>Randevu bulunamadı</p></div>';
      return;
    }
    
    const booking = { id: doc.id, ...doc.data() };
    renderBookingDetail(booking);
    
  } catch (error) {
    console.error('Error loading booking detail:', error);
    container.innerHTML = '<p class="text-error">Hata oluştu</p>';
  }
}

/**
 * Render booking detail
 */
function renderBookingDetail(booking) {
  const container = document.getElementById('booking-detail-container');
  const startTime = booking.startTime?.toDate ? booking.startTime.toDate() : new Date(booking.startTime);
  const endTime = booking.endTime?.toDate ? booking.endTime.toDate() : new Date(booking.endTime);
  
  container.innerHTML = `
    <div class="booking-detail-card">
      <h1>Randevu Detayları</h1>
      <div class="detail-grid">
        <div class="detail-item">
          <label>Öğrenci:</label>
          <span>${booking.studentName}</span>
        </div>
        <div class="detail-item">
          <label>Öğretmen:</label>
          <span>${booking.teacherName}</span>
        </div>
        <div class="detail-item">
          <label>Konu:</label>
          <span>${booking.subject}</span>
        </div>
        <div class="detail-item">
          <label>Durum:</label>
          <span class="status-badge status-${booking.status}">${booking.status}</span>
        </div>
        <div class="detail-item">
          <label>Başlangıç:</label>
          <span>${window.app.formatDate(startTime)}</span>
        </div>
        <div class="detail-item">
          <label>Bitiş:</label>
          <span>${window.app.formatDate(endTime)}</span>
        </div>
        <div class="detail-item">
          <label>Süre:</label>
          <span>${booking.duration} dakika</span>
        </div>
        <div class="detail-item">
          <label>Ücret:</label>
          <span>${window.app.formatCurrency(booking.price)}</span>
        </div>
      </div>
      
      ${booking.meetingLink ? `
        <div class="meeting-link-section">
          <h2>Ders Linki</h2>
          <a href="${booking.meetingLink}" target="_blank" class="btn btn-primary btn-large">Derse Katıl</a>
        </div>
      ` : ''}
      
      ${booking.notes ? `
        <div class="notes-section">
          <h2>Notlar</h2>
          <p>${booking.notes}</p>
        </div>
      ` : ''}
    </div>
  `;
}

// Export
window.bookingsModule = {
  createBooking,
  loadMyBookings,
  loadBookingDetail,
};
