/**
 * Main App Initialization
 * Loads common components (header/footer) and initializes page-specific scripts
 */

// App state
window.app = {
  currentUser: null,
  isLoading: false,
  notificationCount: 0,
};

/**
 * Load component HTML from /components folder
 */
async function loadComponent(componentName, targetElementId) {
  try {
    const response = await fetch(`/components/${componentName}.html`);
    if (!response.ok) {
      console.warn(`Component ${componentName} not found`);
      return;
    }
    const html = await response.text();
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
      targetElement.innerHTML = html;
      // Initialize component-specific functionality after loading
      if (componentName === 'header') {
        initializeHeader();
      }
    }
  } catch (error) {
    console.error(`Error loading component ${componentName}:`, error);
  }
}

/**
 * Initialize header (navigation, auth status, notifications)
 */
function initializeHeader() {
  // Check auth state and update UI
  updateHeaderAuthState();

  // Profilim butonunu dinamik olarak yönlendir
  window.addEventListener('authStateChanged', async (e) => {
    const user = e.detail.user;
    const profileLink = document.querySelector('.header-user-menu .nav-link[href^="/profile"]');
    if (user && profileLink && window.fb && window.fb.getUserRole) {
      const role = await window.fb.getUserRole(user.uid);
      if (role === 'teacher') {
        profileLink.setAttribute('href', '/profile/teacher.html');
      } else {
        profileLink.setAttribute('href', '/profile/index.html');
      }
    }
  });
  
  // Logout button handler
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await window.fb.auth.signOut();
        showToast('Başarıyla çıkış yaptınız', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (error) {
        console.error('Logout error:', error);
        showToast('Çıkış yapılırken bir hata oluştu', 'error');
      }
    });
  }
  
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // Notifications dropdown (will be implemented with Firebase later)
  const notificationsButton = document.getElementById('notifications-button');
  if (notificationsButton) {
    notificationsButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/notifications.html';
    });
  }
}

/**
 * Update header based on authentication state
 */
function updateHeaderAuthState() {
  const authButtons = document.getElementById('header-auth-buttons');
  const userMenu = document.getElementById('header-user-menu');
  
  if (!authButtons || !userMenu) return;
  
  if (window.app.currentUser) {
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    
    // Update user name
    const userNameElement = document.getElementById('header-user-name');
    if (userNameElement) {
      userNameElement.textContent = window.app.currentUser.displayName || window.app.currentUser.email;
    }
  } else {
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

/**
 * Show loading spinner
 */
function showLoading() {
  window.app.isLoading = true;
  // Can add global loading overlay here
}

/**
 * Hide loading spinner
 */
function hideLoading() {
  window.app.isLoading = false;
  // Remove loading overlay
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 16px 24px;
    background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Format date helper
 */
function formatDate(date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

/**
 * Format currency helper
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
}

/**
 * Initialize app on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Load common components
  await loadComponent('header', 'header-container');
  await loadComponent('footer', 'footer-container');
  
  // Check if Firebase is loaded and initialize auth listener
  if (window.firebase && window.firebase.auth) {
    window.firebase.auth().onAuthStateChanged((user) => {
      window.app.currentUser = user;
      updateHeaderAuthState();
      
      // Trigger custom event for other scripts to listen
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
    });
  }
});

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .hidden {
    display: none !important;
  }
`;
document.head.appendChild(style);

// Export helpers globally
window.app.showToast = showToast;
window.app.showLoading = showLoading;
window.app.hideLoading = hideLoading;
window.app.formatDate = formatDate;
window.app.formatCurrency = formatCurrency;
