/**
 * Teachers Module
 * Handles teacher listing, filtering, and detail view
 */

/**
 * Load and display teachers list
 */
async function loadTeachers(filters = {}) {
  const container = document.getElementById('teachers-list');
  if (!container) return;
  
  try {
    // Show loading
    container.innerHTML = `
      <div class="teacher-card teacher-card-skeleton">
        <div class="teacher-avatar skeleton"></div>
        <div class="teacher-info">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text-sm"></div>
        </div>
      </div>
    `.repeat(3);
    
    const db = window.fb.db;
    let query = db.collection('users').where('role', '==', 'teacher').where('isActive', '==', true);
    
    // Apply filters
    if (filters.subject) {
      query = query.where('subjects', 'array-contains', filters.subject);
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Henüz öğretmen bulunmuyor.</p>
        </div>
      `;
      return;
    }
    
    let teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort by rating
    teachers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    // Filter by price range if specified
    if (filters.minPrice) {
      teachers = teachers.filter(t => t.hourlyRate >= filters.minPrice);
    }
    if (filters.maxPrice) {
      teachers = teachers.filter(t => t.hourlyRate <= filters.maxPrice);
    }
    
    // Render teachers
    container.innerHTML = teachers.map(teacher => renderTeacherCard(teacher)).join('');
    
  } catch (error) {
    console.error('Error loading teachers:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p class="text-error">Öğretmenler yüklenirken bir hata oluştu.</p>
      </div>
    `;
  }
}

/**
 * Render a single teacher card
 */
function renderTeacherCard(teacher) {
  const imageUrl = teacher.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.displayName)}&size=200&background=random`;
  const subjects = teacher.subjects?.join(', ') || 'Branş belirtilmemiş';
  const rating = teacher.rating || 0;
  const reviews = teacher.totalReviews || 0;
  
  return `
    <div class="teacher-card">
      <div class="teacher-avatar" style="background-image: url('${imageUrl}');"></div>
      <div class="teacher-info">
        <h3 class="teacher-name">${teacher.displayName}</h3>
        <p class="teacher-subjects">${subjects}</p>
        <div class="teacher-meta">
          <span class="teacher-price">${window.app.formatCurrency(teacher.hourlyRate)}/saat</span>
          <span class="teacher-rating">⭐ ${rating.toFixed(1)} (${reviews})</span>
        </div>
        ${teacher.bio ? `<p class="teacher-bio">${teacher.bio.substring(0, 100)}${teacher.bio.length > 100 ? '...' : ''}</p>` : ''}
        <a href="/teachers/detail.html?id=${teacher.id}" class="btn btn-sm btn-outline">Profili Gör</a>
      </div>
    </div>
  `;
}

/**
 * Load teacher detail
 */
async function loadTeacherDetail(teacherId) {
  const container = document.getElementById('teacher-detail-container');
  if (!container) return;
  
  try {
    const db = window.fb.db;
    const doc = await db.collection('users').doc(teacherId).get();
    
    if (!doc.exists || doc.data().role !== 'teacher') {
      container.innerHTML = `
        <div class="empty-state">
          <h2>Öğretmen bulunamadı</h2>
          <p>Bu öğretmen mevcut değil veya profili kaldırılmış.</p>
          <a href="/teachers/index.html" class="btn btn-primary">Öğretmen Listesi</a>
        </div>
      `;
      return;
    }
    
    const teacher = { id: doc.id, ...doc.data() };
    renderTeacherDetail(teacher);
    
  } catch (error) {
    console.error('Error loading teacher detail:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p class="text-error">Öğretmen bilgileri yüklenirken bir hata oluştu.</p>
      </div>
    `;
  }
}

/**
 * Render teacher detail page
 */
function renderTeacherDetail(teacher) {
  const container = document.getElementById('teacher-detail-container');
  const imageUrl = teacher.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.displayName)}&size=400&background=random`;
  const subjects = teacher.subjects?.join(', ') || 'Branş belirtilmemiş';
  const rating = teacher.rating || 0;
  const reviews = teacher.totalReviews || 0;
  
  // Render availability
  const availabilityHtml = teacher.availability ? 
    Object.entries(teacher.availability).map(([day, slots]) => {
      const dayName = {
        monday: 'Pazartesi',
        tuesday: 'Salı',
        wednesday: 'Çarşamba',
        thursday: 'Perşembe',
        friday: 'Cuma',
        saturday: 'Cumartesi',
        sunday: 'Pazar'
      }[day] || day;
      
      return slots && slots.length > 0 ? `
        <div class="availability-item">
          <strong>${dayName}:</strong> ${slots.join(', ')}
        </div>
      ` : '';
    }).join('') 
    : '<p class="text-muted">Müsaitlik bilgisi yok</p>';
  
  container.innerHTML = `
    <div class="teacher-detail">
      <div class="teacher-header">
        <div class="teacher-avatar-large" style="background-image: url('${imageUrl}');"></div>
        <div class="teacher-header-info">
          <h1>${teacher.displayName}</h1>
          <p class="teacher-subjects-large">${subjects}</p>
          <div class="teacher-stats">
            <div class="stat-item">
              <span class="stat-value">${window.app.formatCurrency(teacher.hourlyRate)}</span>
              <span class="stat-label">Saatlik Ücret</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">⭐ ${rating.toFixed(1)}</span>
              <span class="stat-label">${reviews} Değerlendirme</span>
            </div>
          </div>
          <button class="btn btn-primary btn-large" id="book-lesson-btn">
            Randevu Al
          </button>
        </div>
      </div>
      
      <div class="teacher-content">
        <div class="teacher-section">
          <h2>Hakkımda</h2>
          <p>${teacher.bio || 'Biyografi bilgisi eklenmemiş.'}</p>
        </div>
        
        <div class="teacher-section">
          <h2>İletişim</h2>
          <p>E-posta: ${teacher.email}</p>
          ${teacher.phone ? `<p>Telefon: ${teacher.phone}</p>` : ''}
        </div>
        
        <div class="teacher-section">
          <h2>Müsaitlik</h2>
          <div class="availability-list">
            ${availabilityHtml}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add booking button handler
  document.getElementById('book-lesson-btn')?.addEventListener('click', () => {
    openBookingModal(teacher);
  });
}

/**
 * Open booking modal (basic implementation)
 */
function openBookingModal(teacher) {
  // Check if user is logged in
  const currentUser = window.fb.getCurrentUser();
  if (!currentUser) {
    window.app.showToast('Randevu almak için giriş yapmalısınız', 'error');
    setTimeout(() => {
      window.location.href = '/auth/login.html';
    }, 1500);
    return;
  }
  
  // For now, show a simple prompt (will be improved in booking flow)
  const confirmed = confirm(`${teacher.displayName} ile randevu almak istiyor musunuz?\n\nSaatlik ücret: ${window.app.formatCurrency(teacher.hourlyRate)}\n\nDevam etmek için rezervasyon sayfasına yönlendirileceksiniz.`);
  
  if (confirmed) {
    // Redirect to booking page (will be created)
    window.location.href = `/bookings/create.html?teacherId=${teacher.id}`;
  }
}

// Export functions
window.teachersModule = {
  loadTeachers,
  loadTeacherDetail,
};

// Admin için "Öğretmen Ekle" butonu göster
document.addEventListener('DOMContentLoaded', async () => {
  const btnContainer = document.getElementById('admin-add-teacher-btn');
  if (btnContainer && window.firebase && window.fb && window.fb.getUserRole) {
    const user = window.firebase.auth().currentUser;
    if (user) {
      window.fb.getUserRole(user.uid).then(role => {
        if (role === 'admin') {
          btnContainer.innerHTML = `<a href="/admin/create-teacher.html" class="btn btn-primary">+ Öğretmen Ekle</a>`;
          btnContainer.style.display = 'block';
        }
      });
    }
  }
});
