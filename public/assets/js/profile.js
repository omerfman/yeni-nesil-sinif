// Profile page logic
window.profileModule = {
  async renderProfileForm(user, data) {
    const container = document.getElementById('profile-info');
    container.innerHTML = `
      <form id="profile-form" class="profile-form">
        <div class="profile-photo-section">
          <img id="profile-photo-preview" src="${data.imageUrl || '/assets/img/default-avatar.png'}" class="profile-photo" alt="Profil Fotoğrafı">
          <input type="file" id="profile-photo-input" accept="image/*">
          <button type="button" id="upload-photo-btn" class="btn btn-sm btn-secondary">Fotoğrafı Yükle</button>
        </div>
        <div class="form-group">
          <label for="displayName">Ad Soyad</label>
          <input type="text" id="displayName" name="displayName" value="${data.displayName || user.displayName}" required>
        </div>
        <div class="form-group">
          <label for="email">E-posta</label>
          <input type="email" id="email" name="email" value="${data.email || user.email}" disabled>
        </div>
        <div class="form-group">
          <label for="bio">Biyografi</label>
          <textarea id="bio" name="bio" rows="3">${data.bio || ''}</textarea>
        </div>
        <button type="submit" class="btn btn-primary">Profili Güncelle</button>
        <div id="profile-success" class="success-message" style="display:none;"></div>
        <div id="profile-error" class="error-message" style="display:none;"></div>
      </form>
    `;
    window.profileModule.initProfileForm(user, data);
  },

  async initProfileForm(user, data) {
    const form = document.getElementById('profile-form');
    const photoInput = document.getElementById('profile-photo-input');
    const photoPreview = document.getElementById('profile-photo-preview');
    const uploadBtn = document.getElementById('upload-photo-btn');
    let uploadedImageUrl = data.imageUrl || '';

    uploadBtn.addEventListener('click', async () => {
      const file = photoInput.files[0];
      if (!file) return alert('Fotoğraf seçin!');
      const formData = new FormData();
      formData.append('image', file);
      // imgbb API anahtarı
      const imgbbKey = 'YOUR_IMGBB_API_KEY';
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        uploadedImageUrl = result.data.url;
        photoPreview.src = uploadedImageUrl;
        alert('Fotoğraf başarıyla yüklendi!');
      } else {
        alert('Fotoğraf yüklenemedi!');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const successEl = document.getElementById('profile-success');
      const errorEl = document.getElementById('profile-error');
      successEl.style.display = 'none';
      errorEl.style.display = 'none';
      const displayName = form.displayName.value.trim();
      const bio = form.bio.value.trim();
      try {
        await window.fb.db.collection('users').doc(user.uid).update({
          displayName,
          bio,
          imageUrl: uploadedImageUrl
        });
        successEl.textContent = 'Profil başarıyla güncellendi!';
        successEl.style.display = 'block';
      } catch (err) {
        errorEl.textContent = 'Profil güncellenemedi: ' + err.message;
        errorEl.style.display = 'block';
      }
    });
  }
};
