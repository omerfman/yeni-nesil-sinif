/**
 * Auth Guard
 * Protects pages by checking user authentication and role
 */

/**
 * Check if user is authenticated
 * If not, redirect to login page
 */
function requireAuth(redirectTo = '/auth/login.html') {
  window.addEventListener('authStateChanged', (e) => {
    if (!e.detail.user) {
      // User not logged in, redirect
      window.location.href = redirectTo;
    }
  });
  
  // Also check immediately if Firebase is already initialized
  if (window.firebase && window.firebase.auth) {
    const currentUser = window.firebase.auth().currentUser;
    if (!currentUser) {
      window.location.href = redirectTo;
    }
  }
}

/**
 * Check if user has specific role
 * If not, redirect to specified page
 */
async function checkRole(requiredRole, redirectTo = '/') {
  window.addEventListener('authStateChanged', async (e) => {
    if (!e.detail.user) {
      window.location.href = '/auth/login.html';
      return;
    }
    
    try {
      const role = await window.fb.getUserRole(e.detail.user.uid);
      
      if (role !== requiredRole) {
        window.app.showToast('Bu sayfaya erişim yetkiniz yok', 'error');
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking role:', error);
      window.location.href = redirectTo;
    }
  });
}

/**
 * Check if user has any of the allowed roles
 */
async function checkRoles(allowedRoles = [], redirectTo = '/') {
  window.addEventListener('authStateChanged', async (e) => {
    if (!e.detail.user) {
      window.location.href = '/auth/login.html';
      return;
    }
    
    try {
      const role = await window.fb.getUserRole(e.detail.user.uid);
      
      if (!allowedRoles.includes(role)) {
        window.app.showToast('Bu sayfaya erişim yetkiniz yok', 'error');
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking roles:', error);
      window.location.href = redirectTo;
    }
  });
}

/**
 * Get current user role
 * Returns a promise that resolves to the user's role
 */
async function getCurrentUserRole() {
  return new Promise((resolve, reject) => {
    if (window.firebase && window.firebase.auth) {
      const currentUser = window.firebase.auth().currentUser;
      if (currentUser) {
        window.fb.getUserRole(currentUser.uid)
          .then(resolve)
          .catch(reject);
      } else {
        resolve(null);
      }
    } else {
      window.addEventListener('authStateChanged', async (e) => {
        if (e.detail.user) {
          try {
            const role = await window.fb.getUserRole(e.detail.user.uid);
            resolve(role);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      }, { once: true });
    }
  });
}

// Export globally
window.authGuard = {
  requireAuth,
  checkRole,
  checkRoles,
  getCurrentUserRole,
};
