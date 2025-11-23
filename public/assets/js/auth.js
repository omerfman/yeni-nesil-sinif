/**
 * Authentication Logic
 * Handles registration, login, logout, and auth state management
 */

// Get error message in Turkish
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/operation-not-allowed': 'Bu işlem şu anda kullanılamıyor.',
    'auth/weak-password': 'Şifre çok zayıf. Daha güçlü bir şifre seçin.',
    'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
    'auth/user-not-found': 'E-posta veya şifre hatalı.',
    'auth/wrong-password': 'E-posta veya şifre hatalı.',
    'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
    'auth/network-request-failed': 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
  };
  
  return errorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// Hide error message
function hideError() {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

// Handle Registration
async function handleRegister(e) {
  e.preventDefault();
  hideError();
  
  const displayName = document.getElementById('display-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;
  const termsAccepted = document.getElementById('terms').checked;
  
  // Validation
  if (!termsAccepted) {
    showError('Kullanım koşullarını kabul etmelisiniz.');
    return;
  }
  
  if (password !== passwordConfirm) {
    showError('Şifreler eşleşmiyor.');
    return;
  }
  
  if (password.length < 6) {
    showError('Şifre en az 6 karakter olmalıdır.');
    return;
  }
  
  // Disable button
  const button = document.getElementById('register-button');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Kayıt yapılıyor...';
  
  try {
    // Register user using Firebase helper
    await window.fb.registerUser(email, password, displayName);
    
    // Show success message
    if (window.app && window.app.showToast) {
      window.app.showToast('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
    }
    
    // Redirect to homepage after short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    
  } catch (error) {
    console.error('Registration error:', error);
    showError(getAuthErrorMessage(error.code));
    
    // Re-enable button
    button.disabled = false;
    button.textContent = originalText;
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  hideError();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  // Disable button
  const button = document.getElementById('login-button');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Giriş yapılıyor...';
  
  try {
    // Login user using Firebase helper
    await window.fb.loginUser(email, password);
    
    // Show success message
    if (window.app && window.app.showToast) {
      window.app.showToast('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
    }
    
    // Get user role and redirect accordingly
    const user = window.fb.getCurrentUser();
    if (user) {
      const role = await window.fb.getUserRole(user.uid);
      
      // Redirect based on role
      setTimeout(() => {
        if (role === 'admin') {
          window.location.href = '/admin/index.html';
        } else if (role === 'teacher') {
          window.location.href = '/teachers/index.html';
        } else {
          window.location.href = '/';
        }
      }, 1000);
    }
    
  } catch (error) {
    console.error('Login error:', error);
    showError(getAuthErrorMessage(error.code));
    
    // Re-enable button
    button.disabled = false;
    button.textContent = originalText;
  }
}

// Initialize auth forms when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  window.addEventListener('authStateChanged', (e) => {
    if (e.detail.user) {
      // User is logged in, redirect to homepage
      const currentPath = window.location.pathname;
      if (currentPath.includes('/auth/')) {
        window.location.href = '/';
      }
    }
  });
  
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});
